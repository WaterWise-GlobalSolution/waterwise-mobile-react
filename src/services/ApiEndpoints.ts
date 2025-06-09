// src/services/ApiEndpoints.ts - Endpoints e Utilitários da API WaterWise
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// ✅ CONFIGURAÇÃO DA API
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:5072/api/v1',
  TIMEOUT: 8000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ✅ TIPOS DA API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  links: LinkDto[];
}

export interface LinkDto {
  href: string;
  rel: string;
  method: string;
}

// ✅ INTERFACES DA API
export interface ProdutorDto {
  id: number;
  nomeCompleto: string;
  email: string;
  telefone?: string;
  cpfCnpj?: string;
  dataCadastro?: string;
  links: LinkDto[];
}

export interface PropriedadeDto {
  id: number;
  nomePropriedade: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  nomeProdutor?: string;
  emailProdutor?: string;
  nivelDegradacao?: string;
  nivelNumerico?: number;
  sensores?: SensorDto[];
  riscoEnchente?: number;
  links: LinkDto[];
}

export interface SensorDto {
  id: number;
  tipoSensor: string;
  modeloDispositivo: string;
  dataInstalacao: string;
  ultimaLeitura?: LeituraRecenteDto;
}

export interface LeituraRecenteDto {
  timestampLeitura: string;
  umidadeSolo?: number;
  temperaturaAr?: number;
  precipitacaoMm?: number;
}

export interface NivelDegradacaoDto {
  id: number;
  codigoDegradacao: string;
  descricaoDegradacao: string;
  nivelNumerico: number;
  acoesCorretivas?: string;
  links: LinkDto[];
}

// ✅ PAYLOADS PARA CRIAÇÃO
export interface CreateProdutorPayload {
  nomeCompleto: string;
  email: string;
  telefone?: string;
  cpfCnpj?: string;
  senha: string;
}

export interface CreatePropriedadePayload {
  idProdutor: number;
  idNivelDegradacao: number;
  nomePropriedade: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface SensorDataPayload {
  idSensor: number;
  umidadeSolo?: number;
  temperaturaAr?: number;
  precipitacaoMm?: number;
}

// ✅ CLASSE PRINCIPAL DA API
export class WaterWiseApiService {
  private api: AxiosInstance;
  private retryDelay = API_CONFIG.RETRY_DELAY;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para logs
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`❌ API Response Error: ${error.response?.status} ${error.config?.url}`, error.message);
        return Promise.reject(error);
      }
    );
  }

  // ✅ MÉTODO UTILITÁRIO PARA RETRY
  private async withRetry<T>(operation: () => Promise<T>, attempts = API_CONFIG.RETRY_ATTEMPTS): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (attempts > 1 && this.isRetryableError(error)) {
        console.log(`🔄 Tentando novamente... (${API_CONFIG.RETRY_ATTEMPTS - attempts + 1}/${API_CONFIG.RETRY_ATTEMPTS})`);
        await this.delay(this.retryDelay);
        return this.withRetry(operation, attempts - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    return (
      !error.response || // Network error
      error.response.status >= 500 || // Server error
      error.response.status === 408 || // Timeout
      error.code === 'ECONNABORTED' // Request timeout
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ✅ HEALTH CHECK
  async healthCheck(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/health');
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  // ✅ VERIFICAR CONECTIVIDADE
  async checkConnection(): Promise<boolean> {
    try {
      await this.withRetry(() => this.api.get('/NiveisDegradacao?page=1&pageSize=1'));
      return true;
    } catch (error) {
      return false;
    }
  }

  // ✅ AUTENTICAÇÃO
  async login(payload: LoginPayload): Promise<ApiResponse<ProdutorDto>> {
    try {
      const response = await this.withRetry(() => 
        this.api.post('/LoginProdutor', payload)
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  // ✅ PRODUTORES
  async createProdutor(payload: CreateProdutorPayload): Promise<ApiResponse<ProdutorDto>> {
    try {
      const response = await this.withRetry(() => 
        this.api.post('/produtores', payload)
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  async getProdutor(id: number): Promise<ApiResponse<ProdutorDto>> {
    try {
      const response = await this.withRetry(() => 
        this.api.get(`/produtores/${id}`)
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  async updateProdutor(id: number, payload: Partial<CreateProdutorPayload>): Promise<ApiResponse<ProdutorDto>> {
    try {
      const response = await this.withRetry(() => 
        this.api.put(`/produtores/${id}`, { ...payload, id })
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  // ✅ PROPRIEDADES
  async createPropriedade(payload: CreatePropriedadePayload): Promise<ApiResponse<PropriedadeDto>> {
    try {
      const response = await this.withRetry(() => 
        this.api.post('/propriedades', payload)
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  async getPropriedades(params?: {
    page?: number;
    pageSize?: number;
    produtorId?: number;
  }): Promise<ApiResponse<PagedResult<PropriedadeDto>>> {
    try {
      const response = await this.withRetry(() => 
        this.api.get('/propriedades', { params })
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  async getPropriedade(id: number): Promise<ApiResponse<PropriedadeDto>> {
    try {
      const response = await this.withRetry(() => 
        this.api.get(`/propriedades/${id}`)
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  // ✅ NÍVEIS DE DEGRADAÇÃO
  async getNiveisDegradacao(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PagedResult<NivelDegradacaoDto>>> {
    try {
      const response = await this.withRetry(() => 
        this.api.get('/NiveisDegradacao', { params })
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  // ✅ DADOS DOS SENSORES
  async sendSensorData(payload: SensorDataPayload): Promise<ApiResponse<any>> {
    try {
      const response = await this.withRetry(() => 
        this.api.post('/sensor/sensor-data', payload)
      );
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  // ✅ INFO DA API
  async getApiInfo(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/info');
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  // ✅ DATABASE STATUS
  async getDatabaseStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.get('/database/status');
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }
}

// ✅ INSTÂNCIA SINGLETON
export const apiService = new WaterWiseApiService();

// ✅ UTILITÁRIOS PARA TESTE
export const ApiTestUtils = {
  // Teste de conectividade básica
  async testConnection(): Promise<{ connected: boolean; latency?: number; error?: string }> {
    const start = Date.now();
    try {
      const connected = await apiService.checkConnection();
      const latency = Date.now() - start;
      return { connected, latency };
    } catch (error: any) {
      return { 
        connected: false, 
        error: error.message,
        latency: Date.now() - start 
      };
    }
  },

  // Teste completo da API
  async runFullTest(): Promise<{
    connection: boolean;
    health: boolean;
    database: boolean;
    endpoints: { [key: string]: boolean };
    latency: number;
  }> {
    const start = Date.now();
    const results = {
      connection: false,
      health: false,
      database: false,
      endpoints: {} as { [key: string]: boolean },
      latency: 0
    };

    try {
      // Teste de conexão
      results.connection = await apiService.checkConnection();

      // Teste de health
      const healthResult = await apiService.healthCheck();
      results.health = healthResult.success;

      // Teste de database
      const dbResult = await apiService.getDatabaseStatus();
      results.database = dbResult.success;

      // Teste de endpoints
      const degradacaoResult = await apiService.getNiveisDegradacao({ page: 1, pageSize: 1 });
      results.endpoints.niveisDegradacao = degradacaoResult.success;

      results.latency = Date.now() - start;
      return results;
    } catch (error) {
      results.latency = Date.now() - start;
      return results;
    }
  }
};

// ✅ HELPERS PARA DEBUGGING
export const ApiDebugUtils = {
  logApiStatus: async () => {
    console.log('🔍 === DIAGNÓSTICO DA API ===');
    
    const test = await ApiTestUtils.runFullTest();
    
    console.log(`🌐 Conexão: ${test.connection ? '✅' : '❌'}`);
    console.log(`❤️ Health: ${test.health ? '✅' : '❌'}`);
    console.log(`🗄️ Database: ${test.database ? '✅' : '❌'}`);
    console.log(`⏱️ Latência: ${test.latency}ms`);
    
    console.log('📡 Endpoints:');
    Object.entries(test.endpoints).forEach(([endpoint, status]) => {
      console.log(`  ${endpoint}: ${status ? '✅' : '❌'}`);
    });
    
    console.log('🔗 URL Base:', API_CONFIG.BASE_URL);
    console.log('========================');
    
    return test;
  },

  testSpecificEndpoint: async (endpoint: string, method = 'GET') => {
    try {
      console.log(`🧪 Testando: ${method} ${endpoint}`);
      const response = await apiService['api'].request({
        method,
        url: endpoint,
        timeout: 5000
      });
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
      return true;
    } catch (error: any) {
      console.log(`❌ ${endpoint}: ${error.response?.status || 'NETWORK_ERROR'} ${error.message}`);
      return false;
    }
  }
};

export default apiService;
