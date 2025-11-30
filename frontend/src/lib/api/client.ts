/**
 * API Client com roteamento inteligente
 * 
 * - Desktop (SSR): Usa API Routes do Next.js
 * - Mobile (Capacitor): Direciona para URL de producao
 */

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Obtem a URL base da API baseado no ambiente
 */
function getBaseUrl(): string {
  // Verifica se esta no ambiente Capacitor (mobile)
  // Esta verificacao sera mais robusta quando Capacitor for instalado
  const isCapacitor = typeof window !== "undefined" && 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Capacitor?.isNativePlatform?.();

  if (isCapacitor) {
    // Mobile: usa URL de producao
    return process.env.NEXT_PUBLIC_API_URL || "https://api.uzzai.dev";
  }

  // Server-side (SSR)
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  }

  // Client-side (browser): usa API routes do Next.js
  return "/api";
}

/**
 * Cliente de API
 */
export const apiClient = {
  baseUrl: getBaseUrl(),

  /**
   * Requisicao GET
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  },

  /**
   * Requisicao POST
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body: data });
  },

  /**
   * Requisicao PUT
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body: data });
  },

  /**
   * Requisicao PATCH
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body: data });
  },

  /**
   * Requisicao DELETE
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  },

  /**
   * Requisicao generica
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
  },
};

export default apiClient;
