// src/contexts/AuthContext.tsx - VERSÃO CORRIGIDA PARA API
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ✅ CONFIGURAÇÃO CORRETA DA API
const API_BASE_URL = 'http://10.0.2.2:5072/api/v1';

// Criar instância do axios configurada
const createApiInstance = () => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 8000,
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

  // ✅ FUNÇÃO CORRIGIDA PARA TESTAR API REAL
  const checkApiConnection = async (): Promise<boolean> => {
    try {
      console.log('🔍 Testando conexão API:', API_BASE_URL);
      const api = createApiInstance();
      
      // ✅ Testar endpoint que existe: /api/v1/NiveisDegradacao
      const response = await api.get('/NiveisDegradacao?page=1&pageSize=1', { 
        timeout: 5000 
      });
      
      console.log('✅ API respondeu:', response.status, '- Níveis de degradação carregados');
      setIsOnline(true);
      return true;
    } catch (error: any) {
      if (error.response) {
        // API respondeu, mas com erro (401, 500, etc.)
        console.log(`✅ API online - Status: ${error.response.status} (${error.response.statusText})`);
        setIsOnline(true);
        return true;
      } else if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
        console.log('❌ API offline - Erro de conexão:', error.message);
        setIsOnline(false);
        return false;
      } else {
        console.log('❌ API não disponível:', error.message);
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
        
        // Verificar conectividade primeiro
        const apiAvailable = await checkApiConnection();
        console.log('🌐 Status API:', apiAvailable ? 'Online' : 'Offline');
        
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
          
          // Carregar dados adicionais
          if (apiAvailable) {
            await loadUserData(produtorParsed.id);
          } else {
            await loadOfflineData();
          }
          
          console.log('✅ Dados restaurados com sucesso');
        } else {
          console.log('ℹ️ Nenhuma sessão encontrada');
          // Carregar dados mock mesmo sem sessão
          if (!apiAvailable) {
            await createDemoAccounts();
          }
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

  // ✅ FUNÇÃO DE LOGIN CORRIGIDA
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔑 Tentativa de login:', email);
      console.log('🌐 API URL:', API_BASE_URL);
      setLoading(true);
      
      // Verificar conectividade primeiro
      const apiOnline = await checkApiConnection();
      console.log('🌐 API Status:', apiOnline ? 'Online' : 'Offline');
      
      if (apiOnline) {
        try {
          // ✅ Login via API .NET usando endpoint correto
          console.log('🚀 Fazendo login via API...');
          const api = createApiInstance();
          
          // ✅ ENDPOINT CORRETO: /LoginProdutor
          const response = await api.post('/LoginProdutor', {
            email: email.toLowerCase().trim(),
            senha: password
          });

          console.log('📨 Resposta da API:', response.status, response.data);

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
            
            // Carregar dados adicionais
            await loadUserData(produtorData.id);
            
            return true;
          } else {
            console.log('❌ Resposta da API inválida');
            return false;
          }
        } catch (apiError: any) {
          console.log('❌ Erro na API, tentando offline:', apiError.message);
          // Continuar para tentativa offline
        }
      }
      
      // Fallback offline
      console.log('🔄 Tentando login offline...');
      const savedAccounts = await AsyncStorage.getItem('offlineAccounts');
      if (savedAccounts) {
        const accounts = JSON.parse(savedAccounts);
        const account = accounts.find((acc: any) => 
          acc.email.toLowerCase() === email.toLowerCase() && acc.senha === password
        );
        
        if (account) {
          console.log('✅ Login offline bem-sucedido');
          
          await Promise.all([
            AsyncStorage.setItem('produtor', JSON.stringify(account.produtor)),
            AsyncStorage.setItem('propriedade', JSON.stringify(account.propriedade))
          ]);
          
          setProdutor(account.produtor);
          setPropriedade(account.propriedade);
          await loadOfflineData();
          return true;
        }
      }

      console.log('❌ Credenciais não encontradas');
      return false;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO DE REGISTRO CORRIGIDA
  const register = async (produtorData: any, propriedadeData: any): Promise<boolean> => {
    try {
      console.log('📝 Registrando novo usuário...');
      setLoading(true);
      
      const apiOnline = await checkApiConnection();
      
      if (apiOnline) {
        try {
          console.log('🚀 Cadastrando via API...');
          const api = createApiInstance();
          
          // ✅ PAYLOAD CORRETO PARA A API
          const produtorPayload = {
            nomeCompleto: produtorData.nome_completo,
            cpfCnpj: produtorData.cpf_cnpj || null,
            email: produtorData.email,
            telefone: produtorData.telefone || null,
            senha: produtorData.senha
          };

          // 1. Criar produtor usando endpoint correto
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

            // 2. Criar propriedade usando endpoint correto
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

              // Salvar dados
              await Promise.all([
                AsyncStorage.setItem('produtor', JSON.stringify(newProdutor)),
                AsyncStorage.setItem('propriedade', JSON.stringify(newPropriedade))
              ]);
              
              setProdutor(newProdutor);
              setPropriedade(newPropriedade);
              
              await loadMockSensorsData();
              
              console.log('✅ Cadastro via API concluído');
              return true;
            }
          }
        } catch (apiError: any) {
          console.log('❌ Erro na API, cadastrando offline:', apiError.message);
          // Continuar para cadastro offline
        }
      }
      
      // Cadastro offline
      console.log('💾 Cadastrando offline...');
      const newId = Date.now();
      
      const newProdutor: ProdutorRural = {
        id: newId,
        nomeCompleto: produtorData.nome_completo,
        cpfCnpj: produtorData.cpf_cnpj,
        email: produtorData.email,
        telefone: produtorData.telefone,
        dataCadastro: new Date().toISOString(),
      };

      const newPropriedade: PropriedadeRural = {
        id: newId,
        idProdutor: newId,
        idNivelDegradacao: propriedadeData.id_nivel_degradacao,
        nomePropriedade: propriedadeData.nome_propriedade,
        latitude: propriedadeData.latitude,
        longitude: propriedadeData.longitude,
        areaHectares: propriedadeData.area_hectares,
        dataCadastro: new Date().toISOString(),
      };

      // Salvar conta offline
      const offlineAccount = {
        email: produtorData.email,
        senha: produtorData.senha,
        produtor: newProdutor,
        propriedade: newPropriedade
      };

      const existingAccounts = await AsyncStorage.getItem('offlineAccounts');
      const accounts = existingAccounts ? JSON.parse(existingAccounts) : [];
      accounts.push(offlineAccount);
      
      await Promise.all([
        AsyncStorage.setItem('offlineAccounts', JSON.stringify(accounts)),
        AsyncStorage.setItem('produtor', JSON.stringify(newProdutor)),
        AsyncStorage.setItem('propriedade', JSON.stringify(newPropriedade)),
      ]);
      
      setProdutor(newProdutor);
      setPropriedade(newPropriedade);
      
      await loadMockSensorsData();
      
      console.log('✅ Cadastro offline concluído');
      return true;
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA CARREGAR DADOS DO USUÁRIO DA API
  const loadUserData = async (produtorId: number) => {
    try {
      console.log('📊 Carregando dados do usuário ID:', produtorId);
      const api = createApiInstance();
      
      // ✅ Buscar propriedades usando endpoint correto com filtro
      const propriedadesResponse = await api.get('/propriedades', {
        params: {
          page: 1,
          pageSize: 10,
          produtorId: produtorId // Assumindo que a API suporta filtro por produtor
        }
      });

      if (propriedadesResponse.data?.items?.length > 0) {
        const propriedadeAtual = propriedadesResponse.data.items[0];
        
        const propriedadeFormatada: PropriedadeRural = {
          id: propriedadeAtual.id,
          idProdutor: produtorId,
          idNivelDegradacao: propriedadeAtual.idNivelDegradacao || 1,
          nomePropriedade: propriedadeAtual.nomePropriedade,
          latitude: propriedadeAtual.latitude,
          longitude: propriedadeAtual.longitude,
          areaHectares: propriedadeAtual.areaHectares,
          dataCadastro: propriedadeAtual.dataCadastro,
          nomeProdutor: propriedadeAtual.nomeProdutor,
          emailProdutor: propriedadeAtual.emailProdutor,
          nivelDegradacao: propriedadeAtual.nivelDegradacao,
          nivelNumerico: propriedadeAtual.nivelNumerico,
        };
        
        setPropriedade(propriedadeFormatada);
        await AsyncStorage.setItem('propriedade', JSON.stringify(propriedadeFormatada));
        console.log('✅ Propriedade carregada da API');
      }
      
      // Carregar dados mock de sensores
      await loadMockSensorsData();
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados da API:', error);
      console.log('🔄 Fallback para dados offline');
      await loadOfflineData();
    }
  };

  // Criar contas demo para teste offline
  const createDemoAccounts = async () => {
    try {
      const demoAccounts = [
        {
          email: 'joao.silva@waterwise.com',
          senha: 'joao123',
          produtor: {
            id: 1,
            nomeCompleto: 'João Silva Santos',
            cpfCnpj: '123.456.789-00',
            email: 'joao.silva@waterwise.com',
            telefone: '(11) 99999-0001',
            dataCadastro: new Date().toISOString(),
          },
          propriedade: {
            id: 1,
            idProdutor: 1,
            idNivelDegradacao: 2,
            nomePropriedade: 'Fazenda São João',
            latitude: -23.5505,
            longitude: -46.6333,
            areaHectares: 150.75,
            dataCadastro: new Date().toISOString(),
            nivelDegradacao: 'Bom',
            nivelNumerico: 2,
          }
        },
        {
          email: 'maria.oliveira@waterwise.com',
          senha: 'maria123',
          produtor: {
            id: 2,
            nomeCompleto: 'Maria Oliveira Costa',
            cpfCnpj: '987.654.321-00',
            email: 'maria.oliveira@waterwise.com',
            telefone: '(11) 99999-0002',
            dataCadastro: new Date().toISOString(),
          },
          propriedade: {
            id: 2,
            idProdutor: 2,
            idNivelDegradacao: 1,
            nomePropriedade: 'Sítio Esperança',
            latitude: -23.5489,
            longitude: -46.6388,
            areaHectares: 85.30,
            dataCadastro: new Date().toISOString(),
            nivelDegradacao: 'Excelente',
            nivelNumerico: 1,
          }
        },
        {
          email: 'carlos.pereira@waterwise.com',
          senha: 'carlos123',
          produtor: {
            id: 3,
            nomeCompleto: 'Carlos Eduardo Lima',
            cpfCnpj: '456.789.123-00',
            email: 'carlos.pereira@waterwise.com',
            telefone: '(11) 99999-0003',
            dataCadastro: new Date().toISOString(),
          },
          propriedade: {
            id: 3,
            idProdutor: 3,
            idNivelDegradacao: 3,
            nomePropriedade: 'Fazenda Verde Vida',
            latitude: -23.5601,
            longitude: -46.6528,
            areaHectares: 320.50,
            dataCadastro: new Date().toISOString(),
            nivelDegradacao: 'Moderado',
            nivelNumerico: 3,
          }
        }
      ];

      const existingAccounts = await AsyncStorage.getItem('offlineAccounts');
      if (!existingAccounts) {
        await AsyncStorage.setItem('offlineAccounts', JSON.stringify(demoAccounts));
        console.log('✅ Contas demo criadas');
      }
    } catch (error) {
      console.error('❌ Erro ao criar contas demo:', error);
    }
  };

  const loadOfflineData = async () => {
    try {
      const [sensoresData, leiturasData, alertasData] = await Promise.all([
        AsyncStorage.getItem('sensores'),
        AsyncStorage.getItem('leituras'),
        AsyncStorage.getItem('alertas'),
      ]);

      if (sensoresData) setSensores(JSON.parse(sensoresData));
      if (leiturasData) setLeituras(JSON.parse(leiturasData));
      if (alertasData) setAlertas(JSON.parse(alertasData));
      
      if (!sensoresData || !leiturasData) {
        await loadMockSensorsData();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados offline:', error);
    }
  };

  const loadMockSensorsData = async () => {
    const mockSensores: SensorIot[] = [
      {
        id: 1,
        tipoSensor: 'Umidade do Solo',
        modeloDispositivo: 'DHT22-WaterWise',
        dataInstalacao: new Date().toISOString(),
        ultimaLeitura: {
          timestampLeitura: new Date().toISOString(),
          umidadeSolo: 45 + Math.random() * 30,
          temperaturaAr: 18 + Math.random() * 15,
          precipitacaoMm: Math.random() < 0.3 ? Math.random() * 10 : 0,
        }
      },
      {
        id: 2,
        tipoSensor: 'Temperatura',
        modeloDispositivo: 'Temp-Sensor-Pro',
        dataInstalacao: new Date().toISOString(),
        ultimaLeitura: {
          timestampLeitura: new Date().toISOString(),
          temperaturaAr: 20 + Math.random() * 15,
        }
      },
      {
        id: 3,
        tipoSensor: 'Precipitação',
        modeloDispositivo: 'Rain-Gauge-Smart',
        dataInstalacao: new Date().toISOString(),
        ultimaLeitura: {
          timestampLeitura: new Date().toISOString(),
          precipitacaoMm: Math.random() < 0.2 ? Math.random() * 15 : 0,
        }
      }
    ];

    const mockLeituras: LeituraSensor[] = [];
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(Date.now() - (i * 60 * 60 * 1000));
      mockLeituras.push({
        idLeitura: i + 1,
        idSensor: 1,
        timestampLeitura: timestamp.toISOString(),
        umidadeSolo: 40 + Math.random() * 35,
        temperaturaAr: 18 + Math.random() * 15,
        precipitacaoMm: Math.random() < 0.25 ? Math.random() * 12 : 0,
      });
    }

    setSensores(mockSensores);
    setLeituras(mockLeituras);
    
    await Promise.all([
      AsyncStorage.setItem('sensores', JSON.stringify(mockSensores)),
      AsyncStorage.setItem('leituras', JSON.stringify(mockLeituras)),
    ]);
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('👋 Fazendo logout...');
      setLoading(true);
      
      await AsyncStorage.multiRemove([
        'produtor', 
        'propriedade', 
        'sensores', 
        'leituras', 
        'alertas'
      ]);
      
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

  const updateProdutor = async (produtorData: Partial<ProdutorRural>): Promise<void> => {
    try {
      if (produtor && isOnline) {
        const api = createApiInstance();
        const response = await api.put(`/produtores/${produtor.id}`, produtorData);
        if (response.data) {
          const updatedProdutor = { ...produtor, ...produtorData };
          await AsyncStorage.setItem('produtor', JSON.stringify(updatedProdutor));
          setProdutor(updatedProdutor);
        }
      } else if (produtor) {
        const updatedProdutor = { ...produtor, ...produtorData };
        await AsyncStorage.setItem('produtor', JSON.stringify(updatedProdutor));
        setProdutor(updatedProdutor);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar produtor:', error);
    }
  };

  const getDashboardMetrics = async (): Promise<any> => {
    try {
      if (!propriedade) return null;

      const area = propriedade.areaHectares;
      const nivelDegradacao = propriedade.nivelNumerico || 1;
      
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

  const getRecentAlerts = async (): Promise<Alerta[]> => {
    try {
      if (isOnline && produtor) {
        // TODO: Implementar quando houver endpoint de alertas na API
      }
      return alertas;
    } catch (error) {
      console.error('❌ Erro carregando alertas:', error);
      return alertas;
    }
  };

  const getSensorReadings = async (): Promise<LeituraSensor[]> => {
    try {
      if (isOnline && propriedade) {
        // TODO: Implementar quando houver endpoint de leituras na API
      }
      return leituras;
    } catch (error) {
      console.error('❌ Erro carregando leituras:', error);
      return leituras;
    }
  };

  const syncData = async (): Promise<void> => {
    try {
      if (!isOnline) {
        console.log('⚠️ Sem conexão para sincronização');
        return;
      }
      
      console.log('🔄 Sincronizando dados...');
      
      const pendingSync = await AsyncStorage.getItem('pendingSync');
      if (pendingSync) {
        const pendingItems = JSON.parse(pendingSync);
        
        for (const item of pendingItems) {
          if (item.type === 'register') {
            await register(item.data.produtorData, item.data.propriedadeData);
          }
        }
        
        await AsyncStorage.removeItem('pendingSync');
      }
      
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
