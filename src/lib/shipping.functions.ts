import { createServerFn } from "@tanstack/react-start";

export type ShippingOption = {
  code: string;
  name: string;
  price: number;
  days: number;
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

const DEFAULT_SERVICES: Record<string, string> = {
  "03220": "SEDEX",
  "03298": "PAC",
};

const onlyDigits = (v: string) => (v ?? "").replace(/\D/g, "");

export const calculateShipping = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => {
    const cep = onlyDigits(String(data?.cep ?? ""));
    if (cep.length !== 8) throw new Error("CEP inválido. Informe 8 dígitos.");
    return {
      cep,
      weightKg: Number(data?.weightKg) > 0 ? Number(data.weightKg) : 0.5,
      lengthCm: Number(data?.lengthCm) > 0 ? Number(data.lengthCm) : 20,
      widthCm: Number(data?.widthCm) > 0 ? Number(data.widthCm) : 15,
      heightCm: Number(data?.heightCm) > 0 ? Number(data.heightCm) : 5,
      declaredValue: Number(data?.declaredValue) > 0 ? Number(data.declaredValue) : 0,
    };
  })
  .handler(async ({ data }): Promise<ShippingResult> => {
    const usuario = process.env["CORREIOS_USUARIO"];
    const codigoAcesso = process.env["CORREIOS_CODIGO_ACESSO"];
    const cartaoPostagem = process.env["CORREIOS_CARTAO_POSTAGEM"];
    const cepOrigem = onlyDigits(process.env["CORREIOS_CEP_ORIGEM"] ?? "");

    const missing: string[] = [];
    if (!usuario) missing.push("CORREIOS_USUARIO");
    if (!codigoAcesso) missing.push("CORREIOS_CODIGO_ACESSO");
    if (!cartaoPostagem) missing.push("CORREIOS_CARTAO_POSTAGEM");
    if (cepOrigem.length !== 8) missing.push("CORREIOS_CEP_ORIGEM");
    if (missing.length > 0) {
      return {
        ok: false,
        error:
          "O cálculo de frete com os Correios ainda não está configurado. Fale com a loja pelo WhatsApp para confirmar o valor do envio.",
        missingConfig: missing,
      };
    }

    try {
      const tokenRes = await fetch(
        "https://api.correios.com.br/token/v1/autentica/cartaopostagem",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Basic ${btoa(`${usuario}:${codigoAcesso}`)}`,
          },
          body: JSON.stringify({ numero: cartaoPostagem }),
        },
      );
      if (!tokenRes.ok) {
        console.error("Correios token error", tokenRes.status, await tokenRes.text());
        return { ok: false, error: "Não foi possível autenticar nos Correios no momento." };
      }
      const { token } = (await tokenRes.json()) as { token: string };

      const contrato = process.env["CORREIOS_CONTRATO"] ?? "";
      const dr = process.env["CORREIOS_DR"] ?? "";
      const services = (process.env["CORREIOS_SERVICOS"] ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const codes = services.length > 0 ? services : Object.keys(DEFAULT_SERVICES);

      const options: ShippingOption[] = [];
      for (const code of codes) {
        const priceParams = new URLSearchParams({
          cepOrigem,
          cepDestino: data.cep,
          psObjeto: String(Math.round(data.weightKg * 1000)),
          tpObjeto: "2",
          comprimento: String(data.lengthCm),
          largura: String(data.widthCm),
          altura: String(data.heightCm),
          servicosAdicionais: "",
          vlDeclarado: data.declaredValue > 0 ? String(data.declaredValue) : "0",
        });
        if (contrato) priceParams.set("nuContrato", contrato);
        if (dr) priceParams.set("nuDR", dr);

        const [priceRes, dueRes] = await Promise.all([
          fetch(`https://api.correios.com.br/preco/v1/nacional/${code}?${priceParams}`, {
            headers: { authorization: `Bearer ${token}` },
          }),
          fetch(
            `https://api.correios.com.br/prazo/v1/nacional/${code}?cepOrigem=${cepOrigem}&cepDestino=${data.cep}`,
            { headers: { authorization: `Bearer ${token}` } },
          ),
        ]);

        if (!priceRes.ok) {
          console.error("Correios preco error", code, priceRes.status, await priceRes.text());
          continue;
        }
        const price = (await priceRes.json()) as {
          pcFinal?: string;
          txErro?: string;
          coProduto?: string;
          nuRequisicao?: string;
        };
        if (price.txErro || !price.pcFinal) {
          console.error("Correios preco payload", code, price.txErro);
          continue;
        }
        const due = dueRes.ok
          ? ((await dueRes.json()) as { prazoEntrega?: number; txErro?: string })
          : {};

        options.push({
          code,
          name: DEFAULT_SERVICES[code] ?? `Correios ${code}`,
          price: Number(String(price.pcFinal).replace(/\./g, "").replace(",", ".")),
          days: Number(due.prazoEntrega ?? 0),
        });
      }

      if (options.length === 0) {
        return {
          ok: false,
          error: "Os Correios não retornaram opções de envio para este CEP.",
        };
      }
      return { ok: true, options };
    } catch (error) {
      console.error("Correios request failed", error);
      return { ok: false, error: "Não foi possível consultar os Correios agora." };
    }
  });
