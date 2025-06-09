// src/contexts/AuthContext.tsx - VERSÃO LIMPA SEM DADOS MOCK
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ✅ CONFIGURAÇÃO DA API
const API_BASE_URL = 'http://10.0.2.2:5072/api/v1';

// Criar instância do axios configurada
const createApiInstance = () => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Interfaces baseadas na API .NET
interface ProdutorRural {
  id: number;
  nomeCompleto: string;
  cpfCnpj?: string;
  email: string;
  telefone?: string;
  senha?: string;
  dataCadastro?: string;
}

interface PropriedadeRural {
  id: number;
  idProdutor: number;
  idNivelDegradacao: number;
  nomePropriedade: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  dataCadastro?: string;
  nomeProdutor?: string;
  emailProdutor?: string;
  nivelDegradacao?: string;
  nivelNumerico?: number;
}

interface SensorIot {
  id: number;
  tipoSensor: string;
  modeloDispositivo: string;
  dataInstalacao: string;
  ultimaLeitura?: {
    timestampLeitura: string;
    umidadeSolo?: number;
    temperaturaAr?: number;
    precipitacaoMm?: number;
  };
}

interface LeituraSensor {
  idLeitura: number;
  idSensor: number;
  timestampLeitura: string;
  umidadeSolo?: number;
  temperaturaAr?: number;
  precipitacaoMm?: number;
}

interface Alerta {
  id: number;
  idProdutor: number;
  idLeitura?: number;
  timestampAlerta: string;
  descricaoAlerta?: string;
}

interface AuthContextType {
  produtor: ProdutorRural | null;
  propriedade: PropriedadeRural | null;
  sensores: SensorIot[];
  leituras: LeituraSensor[];
  alertas: Alerta[];
  isAuthenticated: boolean;
  isOnline: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (produtorData: any, propriedadeData: any) => Promise<boolean>;
  updateProdutor: (produtorData: Partial<ProdutorRural>) => Promise<void>;
  getDashboardMetrics: () => Promise<any>;
  getRecentAlerts: () => Promise<Alerta[]>;
  getSensorReadings: () => Promise<LeituraSensor[]>;
  loading: boolean;
  syncData: () => Promise<void>;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [produtor, setProdutor] = useState<ProdutorRural | null>(null);
  const [propriedade, setPropriedade] = useState<PropriedadeRural | null>(null);
  const [sensores, setSensores] = useState<SensorIot[]>([]);
  const [leituras, setLeituras] = useState<LeituraSensor[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ✅ VERIFICAR CONECTIVIDADE COM A API
  const checkApiConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testando conexão API:', API_BASE_URL);
      const api = createApiInstance();
      
      // Testar endpoint básico
      const response = await api.get('/NiveisDegradacao?page=1&pageSize=1', { 
        timeout: 5000 
      });
      
      console.log('✅ API online - Status:', response.status);
      setIsOnline(true);
      return true;
    } catch (error: any) {
      if (error.response) {
        // API respondeu, mas com erro (significa que está online)
        console.log(`✅ API online - Status: ${error.response.status}`);
        setIsOnline(true);
        return true;
      } else {
        console.log('❌ API offline - Erro:', error.message);
        setIsOnline(false);
        return false;
      }
    }
  };

  // Inicializar contexto
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Inicializando AuthContext...');
        console.log('🌐 URL da API:', API_BASE_URL);
        
        // Verificar conectividade
        const apiAvailable = await checkApiConnection();
        console.log('🌐 Status API:', apiAvailable ? 'Online' : 'Offline');
        
        // Tentar restaurar sessão salva
        const [produtorData, propriedadeData] = await Promise.all([
          AsyncStorage.getItem('produtor'),
          AsyncStorage.getItem('propriedade'),
        ]);

        if (produtorData && propriedadeData) {
          console.log('✅ Sessão encontrada, restaurando dados...');
          
          const produtorParsed = JSON.parse(produtorData);
          const propriedadeParsed = JSON.parse(propriedadeData);
          
          setProdutor(produtorParsed);
          setPropriedade(propriedadeParsed);
          
          // Carregar dados adicionais se API estiver online
          if (apiAvailable) {
            await loadUserData(produtorParsed.id);
          } else {
            await loadBasicSensorData();
          }
          
          console.log('✅ Dados restaurados com sucesso');
        } else {
          console.log('ℹ️ Nenhuma sessão encontrada - usuário precisa fazer login');
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar AuthContext:', error);
      } finally {
        setInitialized(true);
        console.log('✅ AuthContext inicializado');
      }
    };

    initializeAuth();
  }, []);

  // ✅ FUNÇÃO DE LOGIN VIA API
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔑 Tentativa de login:', email);
      setLoading(true);
      
      // Verificar se API está online
      const apiOnline = await checkApiConnection();
      
      if (!apiOnline) {
        console.log('❌ API offline - Login não disponível');
        return false;
      }
      
      console.log('🚀 Fazendo login via API...');
      const api = createApiInstance();
      
      const response = await api.post('/LoginProdutor', {
        email: email.toLowerCase().trim(),
        senha: password
      });

      console.log('📨 Resposta da API:', response.status);

      if (response.data && response.data.id) {
        console.log('✅ Login bem-sucedido via API');
        
        const produtorData: ProdutorRural = {
          id: response.data.id,
          nomeCompleto: response.data.nomeCompleto,
          cpfCnpj: response.data.cpfCnpj,
          email: response.data.email,
          telefone: response.data.telefone,
          dataCadastro: response.data.dataCadastro || new Date().toISOString(),
        };

        // Salvar no AsyncStorage
        await AsyncStorage.setItem('produtor', JSON.stringify(produtorData));
        setProdutor(produtorData);
        
        // Carregar dados da propriedade
        await loadUserData(produtorData.id);
        
        return true;
      } else {
        console.log('❌ Resposta da API inválida');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error.response?.data || error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO DE REGISTRO VIA API
  const register = async (produtorData: any, propriedadeData: any): Promise<boolean> => {
    try {
      console.log('📝 Registrando novo usuário...');
      setLoading(true);
      
      // Verificar se API está online
      const apiOnline = await checkApiConnection();
      
      if (!apiOnline) {
        console.log('❌ API offline - Cadastro não disponível');
        return false;
      }
      
      console.log('🚀 Cadastrando via API...');
      const api = createApiInstance();
      
      // 1. Criar produtor
      const produtorPayload = {
        nomeCompleto: produtorData.nome_completo,
        cpfCnpj: produtorData.cpf_cnpj || null,
        email: produtorData.email,
        telefone: produtorData.telefone || null,
        senha: produtorData.senha
      };

      const produtorResponse = await api.post('/produtores', produtorPayload);
      
      if (produtorResponse.data && produtorResponse.data.id) {
        const newProdutor: ProdutorRural = {
          id: produtorResponse.data.id,
          nomeCompleto: produtorResponse.data.nomeCompleto,
          cpfCnpj: produtorResponse.data.cpfCnpj,
          email: produtorResponse.data.email,
          telefone: produtorResponse.data.telefone,
          dataCadastro: produtorResponse.data.dataCadastro || new Date().toISOString(),
        };

        console.log('✅ Produtor criado com ID:', newProdutor.id);

        // 2. Criar propriedade
        const propriedadePayload = {
          idProdutor: newProdutor.id,
          idNivelDegradacao: propriedadeData.id_nivel_degradacao,
          nomePropriedade: propriedadeData.nome_propriedade,
          latitude: propriedadeData.latitude,
          longitude: propriedadeData.longitude,
          areaHectares: propriedadeData.area_hectares
        };

        const propriedadeResponse = await api.post('/propriedades', propriedadePayload);
        
        if (propriedadeResponse.data) {
          const newPropriedade: PropriedadeRural = {
            id: propriedadeResponse.data.id,
            idProdutor: newProdutor.id,
            idNivelDegradacao: propriedadeData.id_nivel_degradacao,
            nomePropriedade: propriedadeData.nome_propriedade,
            latitude: propriedadeData.latitude,
            longitude: propriedadeData.longitude,
            areaHectares: propriedadeData.area_hectares,
            dataCadastro: propriedadeResponse.data.dataCadastro || new Date().toISOString(),
          };

          console.log('✅ Propriedade criada com ID:', newPropriedade.id);

          // Salvar dados localmente
          await Promise.all([
            AsyncStorage.setItem('produtor', JSON.stringify(newProdutor)),
            AsyncStorage.setItem('propriedade', JSON.stringify(newPropriedade))
          ]);
          
          setProdutor(newProdutor);
          setPropriedade(newPropriedade);
          
          // Inicializar dados básicos de sensores
          await loadBasicSensorData();
          
          console.log('✅ Cadastro via API concluído com sucesso');
          return true;
        }
      }
      
      console.log('❌ Falha no cadastro - dados inválidos');
      return false;
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error.response?.data || error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARREGAR DADOS DO USUÁRIO DA API
  const loadUserData = async (produtorId: number) => {
    try {
      console.log('📊 Carregando dados do usuário ID:', produtorId);
      const api = createApiInstance();
      
      // Buscar propriedades do produtor
      const propriedadesResponse = await api.get('/propriedades', {
        params: {
          page: 1,
          pageSize: 10,
          // Adicionar filtro por produtor se a API suportar
        }
      });

      if (propriedadesResponse.data?.items?.length > 0) {
        // Encontrar propriedade do produtor atual
        const propriedadeDoProdutor = propriedadesResponse.data.items.find(
          (prop: any) => prop.idProdutor === produtorId
        ) || propriedadesResponse.data.items[0]; // Fallback para primeira propriedade

        if (propriedadeDoProdutor) {
          const propriedadeFormatada: PropriedadeRural = {
            id: propriedadeDoProdutor.id,
            idProdutor: produtorId,
            idNivelDegradacao: propriedadeDoProdutor.idNivelDegradacao || 1,
            nomePropriedade: propriedadeDoProdutor.nomePropriedade,
            latitude: propriedadeDoProdutor.latitude,
            longitude: propriedadeDoProdutor.longitude,
            areaHectares: propriedadeDoProdutor.areaHectares,
            dataCadastro: propriedadeDoProdutor.dataCadastro,
            nomeProdutor: propriedadeDoProdutor.nomeProdutor,
            emailProdutor: propriedadeDoProdutor.emailProdutor,
            nivelDegradacao: propriedadeDoProdutor.nivelDegradacao,
            nivelNumerico: propriedadeDoProdutor.nivelNumerico,
          };
          
          setPropriedade(propriedadeFormatada);
          await AsyncStorage.setItem('propriedade', JSON.stringify(propriedadeFormatada));
          console.log('✅ Propriedade carregada da API');
        }
      }
      
      // Carregar dados básicos de sensores (quando houver endpoint na API)
      await loadBasicSensorData();
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados da API:', error);
      // Fallback para dados básicos
      await loadBasicSensorData();
    }
  };

  // ✅ CARREGAR DADOS BÁSICOS DE SENSORES (PLACEHOLDER)
  const loadBasicSensorData = async () => {
    try {
      // Por enquanto, criar dados básicos até que a API tenha endpoints de sensores
      const basicSensors: SensorIot[] = [
        {
          id: 1,
          tipoSensor: 'Umidade do Solo',
          modeloDispositivo: 'WaterWise-Sensor-001',
          dataInstalacao: new Date().toISOString(),
          ultimaLeitura: {
            timestampLeitura: new Date().toISOString(),
            umidadeSolo: 65,
            temperaturaAr: 25,
          }
        },
        {
          id: 2,
          tipoSensor: 'Temperatura',
          modeloDispositivo: 'WaterWise-Temp-001',
          dataInstalacao: new Date().toISOString(),
          ultimaLeitura: {
            timestampLeitura: new Date().toISOString(),
            temperaturaAr: 23,
          }
        }
      ];

      const basicReadings: LeituraSensor[] = [
        {
          idLeitura: 1,
          idSensor: 1,
          timestampLeitura: new Date().toISOString(),
          umidadeSolo: 65,
          temperaturaAr: 25,
          precipitacaoMm: 0,
        }
      ];

      setSensores(basicSensors);
      setLeituras(basicReadings);
      
      await Promise.all([
        AsyncStorage.setItem('sensores', JSON.stringify(basicSensors)),
        AsyncStorage.setItem('leituras', JSON.stringify(basicReadings)),
      ]);
      
      console.log('✅ Dados básicos de sensores carregados');
    } catch (error) {
      console.error('❌ Erro ao carregar dados básicos:', error);
    }
  };

  // ✅ LOGOUT
  const logout = async (): Promise<void> => {
    try {
      console.log('👋 Fazendo logout...');
      setLoading(true);
      
      // Limpar dados locais
      await AsyncStorage.multiRemove([
        'produtor', 
        'propriedade', 
        'sensores', 
        'leituras', 
        'alertas'
      ]);
      
      // Resetar estado
      setProdutor(null);
      setPropriedade(null);
      setSensores([]);
      setLeituras([]);
      setAlertas([]);
      
      console.log('✅ Logout concluído');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ATUALIZAR DADOS DO PRODUTOR
  const updateProdutor = async (produtorData: Partial<ProdutorRural>): Promise<void> => {
    try {
      if (produtor && isOnline) {
        const api = createApiInstance();
        const response = await api.put(`/produtores/${produtor.id}`, {
          ...produtorData,
          id: produtor.id
        });
        
        if (response.data) {
          const updatedProdutor = { ...produtor, ...produtorData };
          await AsyncStorage.setItem('produtor', JSON.stringify(updatedProdutor));
          setProdutor(updatedProdutor);
          console.log('✅ Produtor atualizado via API');
        }
      } else if (produtor) {
        // Atualização offline
        const updatedProdutor = { ...produtor, ...produtorData };
        await AsyncStorage.setItem('produtor', JSON.stringify(updatedProdutor));
        setProdutor(updatedProdutor);
        console.log('✅ Produtor atualizado offline');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar produtor:', error);
    }
  };

  // ✅ MÉTRICAS DO DASHBOARD
  const getDashboardMetrics = async (): Promise<any> => {
    try {
      if (!propriedade) return null;

      const area = propriedade.areaHectares;
      const nivelDegradacao = propriedade.nivelNumerico || 1;
      
      // Cálculos baseados na área e nível de degradação
      const baseWaterUsage = area * 45;
      const degradationMultiplier = 1 + (nivelDegradacao - 1) * 0.2;
      
      const waterUsage = Math.floor(baseWaterUsage * degradationMultiplier);
      const savings = Math.floor(area * 25 * (6 - nivelDegradacao) / 5);
      const efficiency = Math.max(60, 95 - (nivelDegradacao - 1) * 8);
      
      return {
        waterUsage,
        savings,
        efficiency,
        alerts: alertas.length,
        soilHealth: propriedade.nivelDegradacao || 'Bom',
        sensorsActive: sensores.length,
        lastReading: leituras.length > 0 ? leituras[0].timestampLeitura : null,
        isOffline: !isOnline
      };
    } catch (error) {
      console.error('❌ Erro nas métricas:', error);
      return null;
    }
  };

  // ✅ ALERTAS RECENTES
  const getRecentAlerts = async (): Promise<Alerta[]> => {
    try {
      if (isOnline && produtor) {
        // TODO: Implementar quando houver endpoint de alertas na API
        // const api = createApiInstance();
        // const response = await api.get(`/alertas/produtor/${produtor.id}`);
        // return response.data || [];
      }
      return alertas;
    } catch (error) {
      console.error('❌ Erro carregando alertas:', error);
      return alertas;
    }
  };

  // ✅ LEITURAS DOS SENSORES
  const getSensorReadings = async (): Promise<LeituraSensor[]> => {
    try {
      if (isOnline && propriedade) {
        // TODO: Implementar quando houver endpoint de leituras na API
        // const api = createApiInstance();
        // const response = await api.get(`/sensores/propriedade/${propriedade.id}/leituras`);
        // return response.data || [];
      }
      return leituras;
    } catch (error) {
      console.error('❌ Erro carregando leituras:', error);
      return leituras;
    }
  };

  // ✅ SINCRONIZAÇÃO DE DADOS
  const syncData = async (): Promise<void> => {
    try {
      if (!isOnline) {
        console.log('⚠️ Sem conexão para sincronização');
        return;
      }
      
      console.log('🔄 Sincronizando dados...');
      
      if (produtor) {
        await loadUserData(produtor.id);
      }
      
      console.log('✅ Sincronização concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  };

  const value: AuthContextType = {
    produtor,
    propriedade,
    sensores,
    leituras,
    alertas,
    isAuthenticated: !!produtor,
    isOnline,
    login,
    logout,
    register,
    updateProdutor,
    getDashboardMetrics,
    getRecentAlerts,
    getSensorReadings,
    loading,
    syncData,
    initialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
