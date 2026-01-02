type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

type RequestOptions<TBody> = {
  path: string;
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  withoutAuth?: boolean;
};

type TokenProvider = () => string | null;
type TokenUpdater = (token: string | null) => void;

const DEFAULT_TOKEN_KEY = 'auth-access-token';
const envBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '');
const DEFAULT_BASE_URL = envBaseUrl || 'http://localhost:8080';

/**
 * Lightweight fetch wrapper with:
 * - base URL + withCredentials
 * - Bearer injection from localStorage
 * - single refresh-on-401 retry using /api/auth/refresh-token (expects httpOnly cookie)
 */
export class ApiClient {
  private baseUrl: string;
  private getToken: TokenProvider;
  private setToken: TokenUpdater;
  private isRefreshing = false;

  constructor (opts?: { baseUrl?: string; getToken?: TokenProvider; setToken?: TokenUpdater }) {
    this.baseUrl = (opts?.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.getToken = opts?.getToken || (() => localStorage.getItem(DEFAULT_TOKEN_KEY));
    this.setToken =
      opts?.setToken ||
      ((token) => {
        if (token) {
          localStorage.setItem(DEFAULT_TOKEN_KEY, token);
        } else {
          localStorage.removeItem(DEFAULT_TOKEN_KEY);
        }
      });
  }

  async request<TResponse, TBody = Record<string, unknown>>(
    options: RequestOptions<TBody>
  ): Promise<ApiResponse<TResponse>> {
    const { path, method = 'GET', body, headers = {}, withoutAuth = false } = options;
    const token = this.getToken();

    const res = await this.fetchWithAuth<TResponse>({
      path,
      method,
      body,
      headers,
      token: withoutAuth ? null : token
    });

    if (res.status === 401 && !withoutAuth) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.fetchWithAuth<TResponse>({
          path,
          method,
          body,
          headers,
          token: refreshed
        });
      }
    }

    return res;
  }

  private async fetchWithAuth<TResponse>({
    path,
    method,
    body,
    headers,
    token
  }: {
    path: string;
    method: HttpMethod;
    body?: unknown;
    headers: Record<string, string>;
    token: string | null;
  }): Promise<ApiResponse<TResponse>> {
    const finalHeaders: Record<string, string> = { ...headers };
    if (body && !finalHeaders['Content-Type']) {
      finalHeaders['Content-Type'] = 'application/json';
    }
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(this.buildUrl(path), {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    });

    const json = (await response.json().catch(() => ({}))) as ApiResponse<TResponse>;
    if (!response.ok) {
      const message = json?.message || json?.error || response.statusText;
      throw new Error(message);
    }

    return json;
  }

  private async refreshAccessToken (): Promise<string | null> {
    if (this.isRefreshing) return null;
    this.isRefreshing = true;

    try {
      const response = await fetch(this.buildUrl('/api/auth/refresh-token'), {
        method: 'POST',
        credentials: 'include'
      });

      const json = (await response.json().catch(() => ({}))) as ApiResponse<{ accessToken: string }>;
      if (!response.ok || !json?.data?.accessToken) {
        this.setToken(null);
        return null;
      }

      this.setToken(json.data.accessToken);
      return json.data.accessToken;
    } catch {
      this.setToken(null);
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  private buildUrl (path: string) {
    if (path.startsWith('http')) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }
}

export const apiClient = new ApiClient();
