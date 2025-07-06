import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';

const baseURL = process.env.REACT_APP_API_URL;
if (!baseURL) {
  console.error('Environment variable REACT_APP_API_URL is not defined. API requests may fail.');
}

const apiClient: AxiosInstance = axios.create({
  baseURL: baseURL || '',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message: string = error.response?.data?.message || error.message;
    const status: number | undefined = error.response?.status;
    const data: any = error.response?.data;
    const apiError = new Error(message) as Error & { status?: number; data?: any };
    apiError.status = status;
    apiError.data = data;
    return Promise.reject(apiError);
  }
);

export function setAuthToken(token: string | null): void {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.get(url, config);
  return response.data;
}

export async function post<T>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.post(url, data, config);
  return response.data;
}

export async function put<T>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.put(url, data, config);
  return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await apiClient.delete(url, config);
  return response.data;
}