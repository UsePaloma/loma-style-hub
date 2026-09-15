import { createServerFn } from "@tanstack/react-start";

export type ShippingOption = {
  code: string;
  name: string;
  price: number;
  days: number;
  provider?: string;
};

export type ShippingResult =
  | { ok: true; options: ShippingOption[] }
  | { ok: false; error: string; missingConfig?: string[] };

type Input = {
  cep: string;
  weightKg?: number | undefined;
  lengthCm?: number | undefined;
  widthCm?: number | undefined;
  heightCm?: number | undefined;
  declaredValue?: number | undefined;
};

const DEFAULT_CORREIOS_SERVICES: Record<string, string> = {
  "03220": "SEDEX",
  "03298": "PAC",
};

const onlyDigits = (v: string) => (v ?? "").replace(/\D/g, "");

const parseMoney = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  if (raw.includes(",")) return Number(raw.replace(/\./g, "").replace(",", "."));
  return Number(raw);
};

const parseDays = (value: unknown) => {
  const match = String(value ?? "").match(/\d+/);
  return match ? Number(match[0]) : 0;
};

async function quoteCorreios(data: Input & { cep: string; weightKg: number; lengthCm: number; widthCm: number; heightCm: number; declaredValue: number }) {
  const usuario = process.env["CORREIOS_USUARIO"];
  const codigoAcesso = process.env["CORREIOS_CODIGO_ACESSO"];
  const cartaoPostagem = process.env["CORREIOS_CARTAO_POSTAGEM"];
  const cepOrigem = onlyDigits(process.env["CORREIOS_CEP_ORIGEM"] ?? "");
  if (!usuario || !codigoAcesso || !cartaoPostagem || cepOrigem.length !== 8) return [];

  const tokenRes = await fetch("https://api.correios.com.br/token/v1/autentica/cartaopostagem", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Basic ${btoa(`${usuario}:${codigoAcesso}`)}`,
    },
    body: JSON.stringify({ numero: cartaoPostagem }),
  });
  if (!tokenRes.ok) throw new Error("Não foi possível autenticar nos Correios no momento.");
  const token = (await tokenRes.json() as { token?: string }).token;
  if (!token) throw new Error("Os Correios não retornaram um token válido.");

  const contrato = process.env["CORREIOS_CONTRATO"] ?? "";
  const dr = process.env["CORREIOS_DR"] ?? "";
  const services = (process.env["CORREIOS_SERVICOS"] ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const codes = services.length > 0 ? services : Object.keys(DEFAULT_CORREIOS_SERVICES);
  const options: ShippingOption[] = [];

  for (const code of codes) {
    const priceParams = new URLSearchParams({
      cepOrigem,
      cepDestino: data.cep,
      psObjeto: String(Math.max(1, Math.round(data.weightKg * 1000))),
      tpObjeto: "2",
      comprimento: String(data.lengthCm),
      largura: String(data.widthCm),
      altura: String(data.heightCm),
      vlDeclarado: data.declaredValue > 0 ? String(data.declaredValue) : "0",
    });
    if (contrato) priceParams.set("nuContrato", contrato);
    if (dr) priceParams.set("nuDR", dr);

    const [priceRes, dueRes] = await Promise.all([
      fetch(`https://api.correios.com.br/preco/v1/nacional/${code}?${priceParams}`, {
        headers: { authorization: `Bearer ${token}`, accept: "application/json" },
      }),
      fetch(`https://api.correios.com.br/prazo/v1/nacional/${code}?cepOrigem=${cepOrigem}&cepDestino=${data.cep}`, {
        headers: { authorization: `Bearer ${token}`, accept: "application/json" },
      }),
    ]);

    if (!priceRes.ok) continue;
    const price = await priceRes.json() as { pcFinal?: string | number; txErro?: string };
    const finalPrice = parseMoney(price.pcFinal);
    if (price.txErro || !Number.isFinite(finalPrice) || finalPrice <= 0) continue;
    const due = dueRes.ok ? await dueRes.json() as { prazoEntrega?: number } : {};
    options.push({
      code,
      name: `Correios · ${DEFAULT_CORREIOS_SERVICES[code] ?? code}`,
      price: finalPrice,
      days: Number(due.prazoEntrega ?? 0),
      provider: "Correios",
    });
  }
  return options;
}

async function quoteMelhorEnvio(data: Input & { cep: string; weightKg: number; lengthCm: number; widthCm: number; heightCm: number; declaredValue: number }) {
  const token = process.env["MELHOR_ENVIO_TOKEN"];
  const cepOrigem = onlyDigits(process.env["MELHOR_ENVIO_CEP_ORIGEM"] ?? process.env["CORREIOS_CEP_ORIGEM"] ?? "");
  if (!token || cepOrigem.length !== 8) return [];

  const endpoint = process.env["MELHOR_ENVIO_API_URL"] || "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": process.env["MELHOR_ENVIO_USER_AGENT"] || "USE LOMA (contato@useloma.com.br)",
    },
    body: JSON.stringify({
      from: { postal_code: cepOrigem },
      to: { postal_code: data.cep },
      products: [{
        id: "produto",
        width: data.widthCm,
        height: data.heightCm,
        length: data.lengthCm,
        weight: data.weightKg,
        insurance_value: Number(data.declaredValue.toFixed(2)),
        quantity: 1,
      }],
      options: { receipt: false, own_hand: false },
    }),
  });
  if (!response.ok) throw new Error("O Melhor Envio não conseguiu calcular o frete agora.");

  const payload = await response.json() as Array<{
    id?: number | string;
    name?: string;
    price?: string | number;
    custom_price?: string | number;
    delivery_time?: number;
    custom_delivery_time?: number;
    company?: { name?: string };
    error?: string;
  }>;
  if (!Array.isArray(payload)) return [];

  return payload
    .filter((item) => !item.error)
    .map((item) => {
      const price = parseMoney(item.custom_price ?? item.price);
      return {
        code: String(item.id ?? item.name ?? "melhor-envio"),
        name: `Melhor Envio · ${item.company?.name ? `${item.company.name} · ` : ""}${item.name ?? "Envio"}`,
        price,
        days: Number(item.custom_delivery_time ?? item.delivery_time ?? 0),
        provider: "Melhor Envio",
      } satisfies ShippingOption;
    })
    .filter((item) => Number.isFinite(item.price) && item.price > 0);
}

async function quoteFrenet(data: Input & { cep: string; weightKg: number; lengthCm: number; widthCm: number; heightCm: number; declaredValue: number }) {
  const token = process.env["FRENET_TOKEN"];
  const cepOrigem = onlyDigits(process.env["FRENET_CEP_ORIGEM"] ?? process.env["CORREIOS_CEP_ORIGEM"] ?? "");
  if (!token || cepOrigem.length !== 8) return [];

  const endpoint = process.env["FRENET_API_URL"] || "https://api.frenet.com.br/shipping/quote";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      token,
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      SellerCEP: cepOrigem,
      RecipientCEP: data.cep,
      ShipmentInvoiceValue: data.declaredValue,
      RecipientCountry: "BR",
      ShippingItemArray: [{
        Weight: data.weightKg,
        Length: data.lengthCm,
        Height: data.heightCm,
        Width: data.widthCm,
        Quantity: 1,
      }],
    }),
  });
  if (!response.ok) throw new Error("A Frenet não conseguiu calcular o frete agora.");

  const payload = await response.json() as {
    ShippingSevicesArray?: Array<{
      ServiceCode?: string;
      ServiceDescription?: string;
      Carrier?: string;
      ShippingPrice?: string | number;
      DeliveryTime?: string | number;
      Error?: boolean;
    }>;
  };
  return (payload.ShippingSevicesArray ?? [])
    .filter((item) => !item.Error)
    .map((item) => ({
      code: String(item.ServiceCode ?? "frenet"),
      name: `Frenet · ${item.Carrier ? `${item.Carrier} · ` : ""}${item.ServiceDescription ?? "Envio"}`,
      price: parseMoney(item.ShippingPrice),
      days: parseDays(item.DeliveryTime),
      provider: "Frenet",
    }))
    .filter((item) => Number.isFinite(item.price) && item.price > 0);
}

export const calculateShipping = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => {
    const cep = onlyDigits(String(data?.cep ?? ""));
    if (cep.length !== 8) throw new Error("CEP inválido. Informe 8 dígitos.");
    const weightKg = Number(data?.weightKg);
    const lengthCm = Number(data?.lengthCm);
    const widthCm = Number(data?.widthCm);
    const heightCm = Number(data?.heightCm);
    if (![weightKg, lengthCm, widthCm, heightCm].every((value) => Number.isFinite(value) && value > 0)) {
      throw new Error("O produto precisa ter peso e dimensões válidos para calcular o frete.");
    }
    return {
      cep,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      declaredValue: Number(data?.declaredValue) > 0 ? Number(data.declaredValue) : 0,
    };
  })
  .handler(async ({ data }): Promise<ShippingResult> => {
    const providers = [
      ["Correios", quoteCorreios],
      ["Melhor Envio", quoteMelhorEnvio],
      ["Frenet", quoteFrenet],
    ] as const;
    const configured = providers.filter(([name]) => {
      if (name === "Correios") return Boolean(process.env["CORREIOS_USUARIO"] && process.env["CORREIOS_CODIGO_ACESSO"] && process.env["CORREIOS_CARTAO_POSTAGEM"]);
      if (name === "Melhor Envio") return Boolean(process.env["MELHOR_ENVIO_TOKEN"]);
      return Boolean(process.env["FRENET_TOKEN"]);
    });

    if (configured.length === 0) {
      return {
        ok: false,
        error: "Nenhum provedor de frete está configurado. Configure Correios, Melhor Envio ou Frenet para calcular o envio automaticamente.",
        missingConfig: ["CORREIOS_* ou MELHOR_ENVIO_TOKEN ou FRENET_TOKEN"],
      };
    }

    const results = await Promise.allSettled(configured.map(([, quote]) => quote(data)));
    const options = results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
    if (options.length === 0) {
      const failed = results.some((result) => result.status === "rejected");
      return {
        ok: false,
        error: failed
          ? "Não foi possível obter uma cotação dos provedores configurados. Tente novamente em instantes."
          : "Nenhuma transportadora retornou opção de envio para este CEP.",
      };
    }

    options.sort((a, b) => a.price - b.price || a.days - b.days);
    return { ok: true, options };
  });
