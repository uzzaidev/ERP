/**
 * Configuracao do site
 */
export const siteConfig = {
  name: "ERP UzzAI",
  description: "Sistema ERP Unificado com Inteligencia Artificial",
  slogan: "Think Smart, Think Uzz.Ai",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    website: "https://uzzai.dev",
    github: "https://github.com/uzzaidev/ERP",
  },
} as const;
