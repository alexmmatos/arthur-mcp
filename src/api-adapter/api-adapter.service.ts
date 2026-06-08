import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/configuration';

export class ApiAdapterError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly upstream?: string,
  ) {
    super(message);
    this.name = 'ApiAdapterError';
  }
}

@Injectable()
export class ApiAdapterService {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: config.externalApiBaseUrl,
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getUsers(): Promise<any[]> {
    return this.request(() => this.http.get('/users'));
  }

  async getUserById(userId: string): Promise<any> {
    return this.request(() => this.http.get(`/users/${userId}`));
  }

  async getPosts(): Promise<any[]> {
    return this.request(() => this.http.get('/posts'));
  }

  async createPost(data: { title: string; body: string; userId: number }): Promise<any> {
    return this.request(() => this.http.post('/posts', data));
  }

  private async request<T>(fn: () => Promise<{ data: T }>): Promise<T> {
    try {
      const response = await fn();
      return response.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      const upstream = axiosErr.message;

      if (status === 404) {
        throw new ApiAdapterError('Resource not found', 404, upstream);
      }
      if (axiosErr.code === 'ECONNABORTED') {
        throw new ApiAdapterError('Upstream API timed out', 408, upstream);
      }
      throw new ApiAdapterError('Upstream API error', status, upstream);
    }
  }
}
