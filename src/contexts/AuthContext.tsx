// src/contexts/AuthContext.tsx - VERSÃO CORRIGIDA
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração da API
const API_BASE_URL = 'http://10.0.2.2:5072/api/v1';

// Interfaces baseadas na API .NET
interface ProdutorRural {
  id: number;
  nomeCompleto: string;
  cpfCnpj?: string;
  email: string;
  telefone?: string;
  dataCadastro: string;
}

interface PropriedadeRural {
  id: number;
  idProdutor: number;
  idNivelDegradacao: number;
  nomePropriedade: string;
  latitude: number;
  longitude: number;
  areaHectares: number;
  dataCadastro: string;
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

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Função para criar instância da API
const createApiInstance = () => {
  const axios = require('axios');
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [produtor, setProdutor] = useState<ProdutorRural | null>(null);
  const [propriedade, setPropriedade] = useState<PropriedadeRural | null>(null);
  const [sensores, setSensores] = useState<SensorIot[]>([]);
  const [leituras, setLeituras] = useState<LeituraSensor[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Verificar conectividade com a API
  const checkApiConnection = async (): Promise<boolean> => {
    try {
      const api = createApiInstance();
      await api.get('/info');
      setIsOnline(true);
      return true;
    } catch (error) {
      console.log('API offline, usando dados locais');
      setIsOnline(false);
      return false;
    }
  };

  // Inicializar contexto
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Inicializando AuthContext...');
        
        // Verificar conectividade
        await checkApiConnection();
        
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
          
          // Carregar dados adicionais se online
          if (isOnline) {
            await loadUserData(produtorParsed.id);
          } else {
            await loadOfflineData();
          }
          
          console.log('✅ Dados restaurados com sucesso');
        } else {
          console.log('ℹ️ Nenhuma sessão encontrada');
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

  const loadUserData = async (produtorId: number) => {
    try {
      const api = createApiInstance();
      // Buscar propriedades do produtor
      const propriedadesResponse = await api.get(`/propriedades?produtorId=${produtorId}`);
      if (propriedadesResponse.data.items?.length > 0) {
        const propriedadeAtual = propriedadesResponse.data.items[0];
        setPropriedade(propriedadeAtual);
        
        // Salvar dados localmente
        await AsyncStorage.setItem('propriedade', JSON.stringify(propriedadeAtual));
      }
      
      // Carregar dados mock
      await loadMockSensorsData();
      
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      await loadOfflineData();
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
    } catch (error) {
      console.error('Erro ao carregar dados offline:', error);
    }
  };

  const loadMockSensorsData = async () => {
    // Dados mock de sensores
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
      },
      {
        id: 3,
        tipoSensor: 'Precipitação',
        modeloDispositivo: 'Rain-Gauge-Smart',
        dataInstalacao: new Date().toISOString(),
      }
    ];

    const mockLeituras: LeituraSensor[] = [];
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(Date.now() - (i * 60 * 60 * 1000));
      mockLeituras.push({
        idLeitura: i + 1,
        idSensor: 1,
        timestampLeitura: timestamp.toISOString(),
        umidadeSolo: 45 + Math.random() * 30,
        temperaturaAr: 18 + Math.random() * 15,
        precipitacaoMm: Math.random() < 0.3 ? Math.random() * 10 : 0,
      });
    }

    setSensores(mockSensores);
    setLeituras(mockLeituras);
    
    // Salvar localmente
    await Promise.all([
      AsyncStorage.setItem('sensores', JSON.stringify(mockSensores)),
      AsyncStorage.setItem('leituras', JSON.stringify(mockLeituras)),
    ]);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔑 Tentativa de login:', email);
      setLoading(true);
      
      // Verificar conectividade
      const apiOnline = await checkApiConnection();
      
      if (apiOnline) {
        // Login via API
        const api = createApiInstance();
        const response = await api.post('/LoginProdutor', {
          email: email.toLowerCase().trim(),
          senha: password
        });

        if (response.data && response.data.id) {
          console.log('✅ Login bem-sucedido via API');
          
          const produtorData: ProdutorRural = {
            id: response.data.id,
            nomeCompleto: response.data.nomeCompleto,
            cpfCnpj: response.data.cpfCnpj,
            email: response.data.email,
            telefone: response.data.telefone,
            dataCadastro: new Date().toISOString(),
          };

          // Salvar no AsyncStorage
          await AsyncStorage.setItem('produtor', JSON.stringify(produtorData));
          setProdutor(produtorData);
          
          // Carregar dados adicionais
          await loadUserData(produtorData.id);
          
          return true;
        }
      } else {
        // Fallback offline
        const savedAccounts = await AsyncStorage.getItem('offlineAccounts');
        if (savedAccounts) {
          const accounts = JSON.parse(savedAccounts);
          const account = accounts.find((acc: any) => 
            acc.email.toLowerCase() === email.toLowerCase() && acc.senha === password
          );
          
          if (account) {
            console.log('✅ Login offline bem-sucedido');
            setProdutor(account.produtor);
            setPropriedade(account.propriedade);
            await loadOfflineData();
            return true;
          }
        }
      }

      console.log('❌ Credenciais inválidas');
      return false;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (produtorData: any, propriedadeData: any): Promise<boolean> => {
    try {
      console.log('📝 Registrando novo usuário...');
      setLoading(true);
      
      const apiOnline = await checkApiConnection();
      
      if (apiOnline) {
        // Cadastro via API
        const api = createApiInstance();
        
        // 1. Criar produtor
        const produtorPayload = {
          nomeCompleto: produtorData.nome_completo,
          cpfCnpj: produtorData.cpf_cnpj,
          email: produtorData.email,
          telefone: produtorData.telefone,
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
      } else {
        // Cadastro offline
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
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      return false;
    } finally {
      setLoading(false);
    }
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
        // Implementar quando houver endpoint de alertas
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
        // Implementar quando houver endpoint de leituras
      }
      return leituras;
    } catch (error) {
      console.error('❌ Erro carregando leituras:', error);
      return leituras;
    }
  };

  const syncData = async (): Promise<void> => {
    try {
      if (!isOnline) return;
      
      console.log('🔄 Sincronizando dados...');
      
      // Verificar dados pendentes de sincronização
      const pendingSync = await AsyncStorage.getItem('pendingSync');
      if (pendingSync) {
        const pendingItems = JSON.parse(pendingSync);
        
        for (const item of pendingItems) {
          if (item.type === 'register') {
            // Tentar sincronizar cadastros offline
            await register(item.data.produtorData, item.data.propriedadeData);
          }
        }
        
        // Limpar dados pendentes após sincronização
        await AsyncStorage.removeItem('pendingSync');
      }
      
      // Atualizar dados se usuário logado
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
