import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  CheckSquare,
  BookOpen,
  Users,
  BarChart3,
  Package,
  ShoppingCart,
  Receipt,
  UserCircle,
  Wallet,
  FileText,
  Settings,
  Brain,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Configuracao de navegacao
 */
export const navigation: NavGroup[] = [
  {
    title: "Geral",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Gestao Interna",
    items: [
      {
        title: "Projetos",
        href: "/projetos",
        icon: FolderKanban,
      },
      {
        title: "Reunioes",
        href: "/reunioes",
        icon: Calendar,
      },
      {
        title: "Acoes",
        href: "/acoes",
        icon: CheckSquare,
      },
      {
        title: "Bullet Journal",
        href: "/bullet-journal",
        icon: BookOpen,
      },
      {
        title: "Equipe",
        href: "/equipe",
        icon: Users,
      },
      {
        title: "Performance",
        href: "/performance",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "ERP Comercial",
    items: [
      {
        title: "Produtos",
        href: "/produtos",
        icon: Package,
      },
      {
        title: "Vendas",
        href: "/vendas",
        icon: ShoppingCart,
      },
      {
        title: "PDV",
        href: "/pdv",
        icon: Receipt,
      },
      {
        title: "Clientes",
        href: "/clientes",
        icon: UserCircle,
      },
    ],
  },
  {
    title: "Financeiro",
    items: [
      {
        title: "Fluxo de Caixa",
        href: "/financeiro",
        icon: Wallet,
      },
      {
        title: "Notas Fiscais",
        href: "/notas-fiscais",
        icon: FileText,
      },
    ],
  },
  {
    title: "Inteligencia",
    items: [
      {
        title: "RAG Insights",
        href: "/rag-insights",
        icon: Brain,
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        title: "Configuracoes",
        href: "/configuracoes",
        icon: Settings,
      },
    ],
  },
];
