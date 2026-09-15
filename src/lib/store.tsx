import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import type { MediaRef } from "@/lib/media";

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  media?: MediaRef[];
  price: number;
  groupPrice: number;
  minPeople: number;
  currentPeople: number;
  groupCode: string;
  deadline: string; // ISO date for the countdown
  weightKg?: number | undefined;
  lengthCm?: number | undefined;
  widthCm?: number | undefined;
  heightCm?: number | undefined;
};

export type OrderStatus =
  | "Aguardando Pagamento"
  | "Em Separação"
  | "Aguardando Cota do Grupo"
  | "Enviado"
  | "Concluído";

export type Delivery = "Entrega" | "Retirada";

export const SIZES = ["PP", "P", "M", "G", "GG"] as const;

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  passwordHash: string;
};

export type Order = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  payment: string;
  productId: string;
  productName: string;
  type: "Individual" | "Grupo";
  total: number;
  status: OrderStatus;
  origin: "Site" | "WhatsApp";
  createdAt: string;
  customerId?: string;
  delivery?: Delivery;
  size?: string;
  cep?: string;
  shippingName?: string;
  shippingPrice?: number;
  shippingDays?: number;
};

export type Badge = { icon: string; title: string; subtitle: string };


export type Settings = {
  topBar: string;
  heroTitle: string;
  heroSlogan: string;
  heroImage: string;
  whatsapp: string;
  instagram: string;
  instagramUrl: string;
  footerAbout: string;
  copyright: string;
  badges: Badge[];
  adminPassword: string;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "Aguardando Pagamento",
  "Em Separação",
  "Aguardando Cota do Grupo",
  "Enviado",
  "Concluído",
];

const inDays = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const defaultSettings: Settings = {
  topBar: "Frete fixo para todo o Brasil | Descontos especiais na Compra em Grupo ♡",
  heroTitle: "Mais que moda, é você bem vestida ♡",
  heroSlogan:
    "Peças atemporais, tecidos leves e um jeito acolhedor de vestir. Escolha sua peça sozinha ou junte as amigas e economize na Compra em Grupo.",
  heroImage: "",
  whatsapp: "5511999999999",
  instagram: "@useloma",
  instagramUrl: "https://instagram.com/useloma",
  footerAbout:
    "A USE LOMA nasceu para vestir mulheres reais com sofisticação e conforto. Cada peça é escolhida com carinho, pensando em quem quer se sentir linda todos os dias.",
  copyright: "© 2026 USE LOMA · Moda Feminina. Todos os direitos reservados.",
  badges: [
    { icon: "🛍️", title: "Qualidade em cada detalhe", subtitle: "Tecidos selecionados e acabamento impecável" },
    { icon: "🤍", title: "Looks para todas as ocasiões", subtitle: "Do dia a dia aos momentos especiais" },
    { icon: "👑", title: "Você ainda mais linda", subtitle: "Modelagens que valorizam o seu corpo" },
    { icon: "♡", title: "Moda que conecta mulheres", subtitle: "Compre em grupo e economize junto com as amigas" },
  ],
  adminPassword: "loma123",
};

const defaultProducts: Product[] = [
  {
    id: "p1",
    name: "Vestido Midi Tricot Areia",
    category: "Vestidos",
    description:
      "Vestido midi em tricot canelado, caimento fluido e toque macio. Perfeito para o trabalho e para o jantar de sexta.",
    image: product1,
    price: 150,
    groupPrice: 110,
    minPeople: 5,
    currentPeople: 4,
    groupCode: "GP123",
    deadline: inDays(2),
  },
  {
    id: "p2",
    name: "Camisa de Seda Chocolate",
    category: "Camisas",
    description:
      "Camisa em toque de seda com brilho suave. Combina com alfaiataria, jeans e saia midi.",
    image: product2,
    price: 189,
    groupPrice: 139,
    minPeople: 6,
    currentPeople: 3,
    groupCode: "GP124",
    deadline: inDays(4),
  },
  {
    id: "p3",
    name: "Calça Pantalona Off-White",
    category: "Alfaiataria",
    description:
      "Pantalona de cintura alta com prega marcada. Alonga a silhueta e vai do escritório ao brunch.",
    image: product3,
    price: 219,
    groupPrice: 165,
    minPeople: 5,
    currentPeople: 2,
    groupCode: "GP125",
    deadline: inDays(3),
  },
  {
    id: "p4",
    name: "Cardigan Oversized Caramelo",
    category: "Tricot",
    description:
      "Cardigan amplo com bolsos frontais, quentinho e elegante para os dias mais frescos.",
    image: product4,
    price: 199,
    groupPrice: 149,
    minPeople: 4,
    currentPeople: 3,
    groupCode: "GP126",
    deadline: inDays(5),
  },
];

const defaultOrders: Order[] = [
  {
    id: "PD1001",
    customer: "Marina Alves",
    phone: "(11) 98888-1122",
    address: "Rua das Acácias, 120 - São Paulo/SP",
    payment: "PIX",
    productId: "p1",
    productName: "Vestido Midi Tricot Areia",
    type: "Grupo",
    total: 110,
    status: "Aguardando Cota do Grupo",
    origin: "Site",
    createdAt: new Date().toISOString(),
  },
  {
    id: "PD1002",
    customer: "Juliana Prado",
    phone: "(21) 97777-3344",
    address: "Av. Atlântica, 900 - Rio de Janeiro/RJ",
    payment: "Cartão",
    productId: "p2",
    productName: "Camisa de Seda Chocolate",
    type: "Individual",
    total: 189,
    status: "Em Separação",
    origin: "WhatsApp",
    createdAt: new Date().toISOString(),
  },
];

const digits = (v: string) => v.replace(/\D/g, "");

const hashPassword = (password: string) => {
  let h = 5381;
  for (let i = 0; i < password.length; i++) h = (h * 33) ^ password.charCodeAt(i);
  return `h${(h >>> 0).toString(36)}`;
};

type StoreValue = {
  settings: Settings;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  currentCustomer: Customer | null;
  myOrders: Order[];
  hydrated: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Omit<Order, "id" | "createdAt">) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateMyOrder: (id: string, patch: Pick<Order, "address" | "delivery" | "size">) => boolean;
  deleteOrder: (id: string) => void;
  registerCustomer: (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password: string;
  }) => { ok: boolean; error?: string };
  loginCustomer: (email: string, password: string) => { ok: boolean; error?: string };
  logoutCustomer: () => void;
  updateCustomer: (patch: Partial<Omit<Customer, "id" | "passwordHash">>) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const KEY = "useloma-store-v1";
const SESSION_KEY = "useloma-customer-session";

type Persisted = {
  settings: Settings;
  products: Product[];
  orders: Order[];
  customers: Customer[];
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [orders, setOrders] = useState<Order[]>(defaultOrders);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        if (parsed.settings) setSettings({ ...defaultSettings, ...parsed.settings });
        if (parsed.products) setProducts(parsed.products);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.customers) setCustomers(parsed.customers);
      }
      setSessionId(localStorage.getItem(SESSION_KEY));
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ settings, products, orders, customers }));
  }, [settings, products, orders, customers, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (sessionId) localStorage.setItem(SESSION_KEY, sessionId);
    else localStorage.removeItem(SESSION_KEY);
  }, [sessionId, hydrated]);


  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const saveProduct = useCallback((product: Product) => {
    setProducts((list) =>
      list.some((p) => p.id === product.id)
        ? list.map((p) => (p.id === product.id ? product : p))
        : [...list, product],
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((list) => list.filter((p) => p.id !== id));
  }, []);

  const addOrder = useCallback(
    (order: Omit<Order, "id" | "createdAt">) => {
      const phone = digits(order.phone);
      const matched =
        order.customerId ??
        (phone.length >= 8
          ? customers.find((c) => digits(c.phone) === phone)?.id
          : undefined) ??
        sessionId ??
        undefined;
      const full: Order = {
        ...order,
        ...(matched ? { customerId: matched } : {}),
        id: `PD${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
      };
      setOrders((list) => [full, ...list]);
      return full;
    },
    [customers, sessionId],
  );

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((list) => list.filter((o) => o.id !== id));
  }, []);

  const currentCustomer = useMemo(
    () => customers.find((c) => c.id === sessionId) ?? null,
    [customers, sessionId],
  );

  const myOrders = useMemo(() => {
    if (!currentCustomer) return [];
    const phone = digits(currentCustomer.phone);
    return orders.filter(
      (o) =>
        o.customerId === currentCustomer.id ||
        (!o.customerId && phone.length >= 8 && digits(o.phone) === phone),
    );
  }, [orders, currentCustomer]);

  const registerCustomer = useCallback<StoreValue["registerCustomer"]>(
    ({ name, email, phone, address, password }) => {
      const mail = email.trim().toLowerCase();
      if (customers.some((c) => c.email === mail))
        return { ok: false, error: "Este e-mail já possui uma conta." };
      const customer: Customer = {
        id: `CL${Date.now().toString(36)}`,
        name: name.trim(),
        email: mail,
        phone: phone.trim(),
        address: address.trim(),
        passwordHash: hashPassword(password),
      };
      setCustomers((list) => [...list, customer]);
      setSessionId(customer.id);
      return { ok: true };
    },
    [customers],
  );

  const loginCustomer = useCallback<StoreValue["loginCustomer"]>(
    (email, password) => {
      const mail = email.trim().toLowerCase();
      const found = customers.find((c) => c.email === mail);
      if (!found || found.passwordHash !== hashPassword(password))
        return { ok: false, error: "E-mail ou senha inválidos." };
      setSessionId(found.id);
      return { ok: true };
    },
    [customers],
  );

  const logoutCustomer = useCallback(() => setSessionId(null), []);

  const updateCustomer = useCallback<StoreValue["updateCustomer"]>(
    (patch) => {
      if (!sessionId) return;
      setCustomers((list) =>
        list.map((c) => (c.id === sessionId ? { ...c, ...patch } : c)),
      );
    },
    [sessionId],
  );

  const updateMyOrder = useCallback<StoreValue["updateMyOrder"]>(
    (id, patch) => {
      if (!currentCustomer) return false;
      const allowed = myOrders.some((o) => o.id === id);
      if (!allowed) return false;
      setOrders((list) =>
        list.map((o) =>
          o.id === id ? { ...o, ...patch, customerId: currentCustomer.id } : o,
        ),
      );
      return true;
    },
    [currentCustomer, myOrders],
  );

  const value = useMemo(
    () => ({
      settings,
      products,
      orders,
      customers,
      currentCustomer,
      myOrders,
      hydrated,
      updateSettings,
      saveProduct,
      deleteProduct,
      addOrder,
      updateOrderStatus,
      updateMyOrder,
      deleteOrder,
      registerCustomer,
      loginCustomer,
      logoutCustomer,
      updateCustomer,
    }),
    [
      settings,
      products,
      orders,
      customers,
      currentCustomer,
      myOrders,
      hydrated,
      updateSettings,
      saveProduct,
      deleteProduct,
      addOrder,
      updateOrderStatus,
      updateMyOrder,
      deleteOrder,
      registerCustomer,
      loginCustomer,
      logoutCustomer,
      updateCustomer,
    ],
  );


  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de StoreProvider");
  return ctx;
}

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Normaliza o telefone do responsável: aceita "(11) 99999-9999" e adiciona o DDI 55 quando faltar. */
export const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  if (!d) return "";
  if (d.length <= 11) return `55${d}`;
  return d;
};

export const waLink = (phone: string, message: string) =>
  `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(message)}`;

/** Link de compartilhamento: abre o WhatsApp da cliente para ela escolher com quem falar. */
export const waShare = (message: string) =>
  `https://wa.me/?text=${encodeURIComponent(message)}`;
