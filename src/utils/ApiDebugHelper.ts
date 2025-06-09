// src/utils/ApiDebugHelper.ts - Helper para Debug e Diagnóstico da API
import { apiService, ApiTestUtils, ApiDebugUtils } from '../services/ApiEndpoints';

export interface DebugResult {
  timestamp: string;
  environment: string;
  apiUrl: string;
  connectivity: {
    canConnect: boolean;
    latency: number;
    error?: string;
  };
  endpoints: {
    [key: string]: {
      status: boolean;
      httpCode?: number;
      error?: string;
    };
  };
  suggestions: string[];
}

export class ApiDebugHelper {
  
  // ✅ DIAGNÓSTICO COMPLETO
  static async runDiagnostic(): Promise<DebugResult> {
    const timestamp = new Date().toISOString();
    const apiUrl = 'http://10.0.2.2:5072/api/v1';
    
    console.log('🔍 === INICIANDO DIAGNÓSTICO COMPLETO DA API ===');
    console.log('⏰ Timestamp:', timestamp);
    console.log('🔗 API URL:', apiUrl);
    
    const result: DebugResult = {
      timestamp,
      environment: __DEV__ ? 'development' : 'production',
      apiUrl,
      connectivity: {
        canConnect: false,
        latency: 0
      },
      endpoints: {},
      suggestions: []
    };

    // 1. Teste de conectividade básica
    try {
      console.log('🌐 Testando conectividade básica...');
      const connectionTest = await ApiTestUtils.testConnection();
      result.connectivity = {
        canConnect: connectionTest.connected,
        latency: connectionTest.latency || 0,
        error: connectionTest.error
      };
      
      if (connectionTest.connected) {
        console.log('✅ Conectividade: OK');
      } else {
        console.log('❌ Conectividade: FALHOU');
        console.log('Error:', connectionTest.error);
      }
    } catch (error: any) {
      console.log('❌ Erro no teste de conectividade:', error.message);
      result.connectivity.error = error.message;
    }

    // 2. Teste dos endpoints específicos
    const endpointsToTest = [
      { name: 'health', path: '/health', method: 'GET' },
      { name: 'apiInfo', path: '/info', method: 'GET' },
      { name: 'databaseStatus', path: '/database/status', method: 'GET' },
      { name: 'niveisDegradacao', path: '/NiveisDegradacao?page=1&pageSize=1', method: 'GET' },
      { name: 'propriedades', path: '/propriedades?page=1&pageSize=1', method: 'GET' },
      { name: 'produtores', path: '/produtores?page=1&pageSize=1', method: 'GET' }
    ];

    for (const endpoint of endpointsToTest) {
      try {
        console.log(`🧪 Testando ${endpoint.name}...`);
        const success = await ApiDebugUtils.testSpecificEndpoint(endpoint.path, endpoint.method);
        result.endpoints[endpoint.name] = {
          status: success,
          httpCode: success ? 200 : undefined
        };
      } catch (error: any) {
        result.endpoints[endpoint.name] = {
          status: false,
          error: error.message,
          httpCode: error.response?.status
        };
      }
    }

    // 3. Gerar sugestões baseadas nos resultados
    result.suggestions = this.generateSuggestions(result);

    console.log('📊 === RESULTADO DO DIAGNÓSTICO ===');
    console.log('Conectividade:', result.connectivity.canConnect ? '✅' : '❌');
    console.log('Latência:', `${result.connectivity.latency}ms`);
    console.log('Endpoints funcionando:', Object.values(result.endpoints).filter(e => e.status).length, '/', Object.keys(result.endpoints).length);
    
    if (result.suggestions.length > 0) {
      console.log('💡 Sugestões:');
      result.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
    }
    
    console.log('========================================');
    
    return result;
  }

  // ✅ GERAR SUGESTÕES BASEADAS NO DIAGNÓSTICO
  private static generateSuggestions(result: DebugResult): string[] {
    const suggestions: string[] = [];
    
    if (!result.connectivity.canConnect) {
      suggestions.push('Verifique se a API está rodando em http://localhost:5072');
      suggestions.push('Confirme se o emulador Android pode acessar 10.0.2.2:5072');
      suggestions.push('Teste acessar http://10.0.2.2:5072/api/v1/info no navegador do PC');
      
      if (result.connectivity.error?.includes('ECONNREFUSED')) {
        suggestions.push('A API parece estar offline. Execute: dotnet run no projeto WaterWise.API');
      }
      
      if (result.connectivity.error?.includes('Network Error')) {
        suggestions.push('Problema de rede. Verifique firewall e configurações de rede');
      }
    }

    if (result.connectivity.canConnect) {
      const failedEndpoints = Object.entries(result.endpoints)
        .filter(([_, endpoint]) => !endpoint.status)
        .map(([name, _]) => name);
      
      if (failedEndpoints.length > 0) {
        suggestions.push(`Endpoints com falha: ${failedEndpoints.join(', ')}`);
        
        if (failedEndpoints.includes('databaseStatus')) {
          suggestions.push('Verifique a conexão com o Oracle Database');
          suggestions.push('Confirme as credenciais no appsettings.json');
        }
        
        if (failedEndpoints.includes('niveisDegradacao')) {
          suggestions.push('Tabelas do banco podem não existir. Execute o seed da API');
        }
      }
    }

    if (result.connectivity.latency > 3000) {
      suggestions.push('Latência alta detectada. Verifique a performance da API');
    }

    return suggestions;
  }

  // ✅ TESTE RÁPIDO DE ENDPOINTS ESPECÍFICOS
  static async quickTest(): Promise<{
    login: boolean;
    register: boolean;
    getData: boolean;
  }> {
    console.log('⚡ Executando teste rápido...');
    
    const results = {
      login: false,
      register: false,
      getData: false
    };

    try {
      // Teste de endpoint de login
      const loginTest = await apiService.login({
        email: 'test@test.com',
        senha: 'invalidpassword'
      });
      // Esperamos 401 (Unauthorized) aqui, não 404
      results.login = loginTest.status === 401;
      console.log('🔑 Login endpoint:', results.login ? '✅' : '❌');
      
    } catch (error) {
      console.log('🔑 Login endpoint: ❌');
    }

    try {
      // Teste de endpoint de níveis de degradação
      const dataTest = await apiService.getNiveisDegradacao({ page: 1, pageSize: 1 });
      results.getData = dataTest.success;
      console.log('📊 Dados endpoint:', results.getData ? '✅' : '❌');
      
    } catch (error) {
      console.log('📊 Dados endpoint: ❌');
    }

    try {
      // Teste de criação de produtor (deve dar erro de validação, não 404)
      const registerTest = await apiService.createProdutor({
        nomeCompleto: '',
        email: 'invalid',
        senha: ''
      });
      // Esperamos 400 (Bad Request) aqui, não 404
      results.register = registerTest.status === 400;
      console.log('📝 Register endpoint:', results.register ? '✅' : '❌');
      
    } catch (error) {
      console.log('📝 Register endpoint: ❌');
    }

    return results;
  }

  // ✅ VERIFICAR PROBLEMAS COMUNS
  static async checkCommonIssues(): Promise<{
    apiRunning: boolean;
    databaseConnected: boolean;
    endpointsAccessible: boolean;
    suggestions: string[];
  }> {
    console.log('🔧 Verificando problemas comuns...');
    
    let apiRunning = false;
    let databaseConnected = false;
    let endpointsAccessible = false;
    const suggestions: string[] = [];

    try {
      // 1. API rodando?
      const healthCheck = await apiService.healthCheck();
      apiRunning = healthCheck.success;
      console.log('🏃 API rodando:', apiRunning ? '✅' : '❌');
      
      if (!apiRunning) {
        suggestions.push('Execute: dotnet run no diretório src/WaterWise.API');
        suggestions.push('Verifique se a porta 5072 está livre');
      }
    } catch (error) {
      console.log('🏃 API rodando: ❌');
    }

    try {
      // 2. Database conectado?
      const dbStatus = await apiService.getDatabaseStatus();
      databaseConnected = dbStatus.success && dbStatus.data?.connected;
      console.log('🗄️ Database conectado:', databaseConnected ? '✅' : '❌');
      
      if (!databaseConnected) {
        suggestions.push('Verifique a string de conexão do Oracle no appsettings.json');
        suggestions.push('Confirme se o banco Oracle está acessível');
        suggestions.push('Execute as migrações/scripts SQL se necessário');
      }
    } catch (error) {
      console.log('🗄️ Database conectado: ❌');
    }

    try {
      // 3. Endpoints acessíveis?
      const endpointTest = await apiService.getNiveisDegradacao({ page: 1, pageSize: 1 });
      endpointsAccessible = endpointTest.success;
      console.log('🌐 Endpoints acessíveis:', endpointsAccessible ? '✅' : '❌');
      
      if (!endpointsAccessible) {
        suggestions.push('Verifique se as rotas da API estão configuradas corretamente');
        suggestions.push('Confirme se o versionamento da API está funcionando (/api/v1/)');
      }
    } catch (error) {
      console.log('🌐 Endpoints acessíveis: ❌');
    }

    return {
      apiRunning,
      databaseConnected,
      endpointsAccessible,
      suggestions
    };
  }

  // ✅ HELPER PARA LOGS ESTRUTURADOS
  static logStructured(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const prefix = level === 'info' ? '💡' : level === 'warn' ? '⚠️' : '❌';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (data) {
      console.log('📋 Data:', JSON.stringify(data, null, 2));
    }
  }
}

// ✅ EXPORT DEFAULT
export default ApiDebugHelper;
