import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces baseadas na estrutura do banco de dados Oracle GS_WW_*
interface ProdutorRural {
  id_produtor: number;
  nome_completo: string;
  cpf_cnpj: string;
  email: string;
  telefone?: string;
  senha: string;
  data_cadastro: string;
}

interface NivelDegradacaoSolo {
  id_nivel_degradacao: number;
  codigo_degradacao: string;
  descricao_degradacao: string;
  nivel_numerico: number;
  acoes_corretivas: string;
}

interface PropriedadeRural {
  id_propriedade: number;
  id_produtor: number;
  id_nivel_degradacao: number;
  nome_propriedade: string;
  latitude: number;
  longitude: number;
  area_hectares: number;
  data_cadastro: string;
  tipo_solo?: string;
  // Dados relacionados (JOIN)
  nivel_degradacao?: NivelDegradacaoSolo;
}

interface SensorIot {
  id_sensor: number;
  id_propriedade: number;
  id_tipo_sensor: number;
  modelo_dispositivo?: string;
  data_instalacao: string;
}

interface LeituraSensor {
  id_leitura: number;
  id_sensor: number;
  timestamp_leitura: string;
  umidade_solo?: number;
  temperatura_ar?: number;
  precipitacao_mm?: number;
}

interface Alerta {
  id_alerta: number;
  id_produtor: number;
  id_leitura?: number;
  id_nivel_severidade: number;
  timestamp_alerta: string;
  descricao_alerta?: string;
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
  quickLogin: () => Promise<boolean>;
  loading: boolean;
  syncData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuration for API - deve apontar para sua API .NET ou Java
const API_BASE_URL = 'https://waterwise-api.azurewebsites.net/api';

// Dados mock para funcionamento offline
const mockNiveisDegrade: NivelDegradacaoSolo[] = [
  {
    id_nivel_degradacao: 1,
    codigo_degradacao: 'EXCELENTE',
    descricao_degradacao: 'Solo em excelente estado',
    nivel_numerico: 1,
    acoes_corretivas: 'Manter práticas sustentáveis atuais'
  },
  {
    id_nivel_degradacao: 2,
    codigo_degradacao: 'BOM',
    descricao_degradacao: 'Solo em bom estado com sinais mínimos de degradação',
    nivel_numerico: 2,
    acoes_corretivas: 'Implementar rotação de culturas'
  },
  {
    id_nivel_degradacao: 3,
    codigo_degradacao: 'MODERADO',
    descricao_degradacao: 'Solo com degradação moderada',
    nivel_numerico: 3,
    acoes_corretivas: 'Aplicar calcário e matéria orgânica'
  },
  {
    id_nivel_degradacao: 4,
    codigo_degradacao: 'RUIM',
    descricao_degradacao: 'Solo com degradação severa',
    nivel_numerico: 4,
    acoes_corretivas: 'Recuperação intensiva necessária'
  },
  {
    id_nivel_degradacao: 5,
    codigo_degradacao: 'CRITICO',
    descricao_degradacao: 'Solo em estado crítico',
    nivel_numerico: 5,
    acoes_corretivas: 'Intervenção urgente e especializada'
  }
];

// Usuários mock para desenvolvimento e demonstração
const mockUsers = [
  {
    email: 'joao.silva@waterwise.com',
    senha: 'joao123',
    produtor: {
      id_produtor: 1,
      nome_completo: 'João Silva Santos',
      cpf_cnpj: '12345678910',
      email: 'joao.silva@waterwise.com',
      telefone: '11999999999',
      senha: 'joao123',
      data_cadastro: '2024-01-15T10:30:00Z',
    },
    propriedade: {
      id_propriedade: 1,
      id_produtor: 1,
      id_nivel_degradacao: 2,
      nome_propriedade: 'Fazenda São João',
      latitude: -23.5505199,
      longitude: -46.6333094,
      area_hectares: 150.75,
      data_cadastro: '2024-01-15T10:30:00Z',
      tipo_solo: 'Latossolo',
    }
  },
  {
    email: 'maria.oliveira@waterwise.com',
    senha: 'maria123',
    produtor: {
      id_produtor: 2,
      nome_completo: 'Maria Oliveira Santos',
      cpf_cnpj: '98765432100',
      email: 'maria.oliveira@waterwise.com',
      telefone: '11888888888',
      senha: 'maria123',
      data_cadastro: '2024-02-10T14:20:00Z',
    },
    propriedade: {
      id_propriedade: 2,
      id_produtor: 2,
      id_nivel_degradacao: 1,
      nome_propriedade: 'Sítio Esperança',
      latitude: -23.4500000,
      longitude: -46.5200000,
      area_hectares: 85.30,
      data_cadastro: '2024-02-10T14:20:00Z',
      tipo_solo: 'Argissolo',
    }
  },
  {
    email: 'carlos.pereira@waterwise.com',
    senha: 'carlos123',
    produtor: {
      id_produtor: 3,
      nome_completo: 'Carlos Pereira Lima',
      cpf_cnpj: '12345678000195',
      email: 'carlos.pereira@waterwise.com',
      telefone: '11777777777',
      senha: 'carlos123',
      data_cadastro: '2024-03-05T09:15:00Z',
    },
    propriedade: {
      id_propriedade: 3,
      id_produtor: 3,
      id_nivel_degradacao: 3,
      nome_propriedade: 'Fazenda Verde Vida',
      latitude: -23.6000000,
      longitude: -46.7000000,
      area_hectares: 320.50,
      data_cadastro: '2024-03-05T09:15:00Z',
      tipo_solo: 'Neossolo',
    }
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [produtor, setProdutor] = useState<ProdutorRural | null>(null);
  const [propriedade, setPropriedade] = useState<PropriedadeRural | null>(null);
  const [sensores, setSensores] = useState<SensorIot[]>([]);
  const [leituras, setLeituras] = useState<LeituraSensor[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Função para verificar conectividade
  const checkConnectivity = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const online = response.ok;
        setIsOnline(online);
        return online;
      } catch (error) {
        clearTimeout(timeoutId);
        setIsOnline(false);
        return false;
      }
    } catch (error) {
      setIsOnline(false);
      return false;
    }
  };

  const checkAuthStatus = async () => {
    try {
      const produtorData = await AsyncStorage.getItem('produtor');
      const propriedadeData = await AsyncStorage.getItem('propriedade');
      
      if (produtorData) {
        const produtorObj = JSON.parse(produtorData);
        setProdutor(produtorObj);
        
        if (propriedadeData) {
          const propriedadeObj = JSON.parse(propriedadeData);
          // Adicionar dados do nível de degradação
          const nivelDegrade = mockNiveisDegrade.find(n => n.id_nivel_degradacao === propriedadeObj.id_nivel_degradacao);
          propriedadeObj.nivel_degradacao = nivelDegrade;
          setPropriedade(propriedadeObj);
          
          // Carregar dados mock relacionados
          await loadMockData(propriedadeObj.id_propriedade);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = async (idPropriedade: number) => {
    try {
      // Sensores mock
      const mockSensores: SensorIot[] = [
        {
          id_sensor: 1,
          id_propriedade: idPropriedade,
          id_tipo_sensor: 1,
          modelo_dispositivo: 'DHT22-WaterWise',
          data_instalacao: new Date().toISOString()
        },
        {
          id_sensor: 2,
          id_propriedade: idPropriedade,
          id_tipo_sensor: 2,
          modelo_dispositivo: 'Soil-Moisture-Pro',
          data_instalacao: new Date().toISOString()
        },
        {
          id_sensor: 3,
          id_propriedade: idPropriedade,
          id_tipo_sensor: 3,
          modelo_dispositivo: 'Rain-Gauge-Smart',
          data_instalacao: new Date().toISOString()
        }
      ];

      // Leituras mock - dados mais realistas
      const now = new Date();
      const mockLeituras: LeituraSensor[] = [];
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000)); // Últimas 24 horas
        mockLeituras.push({
          id_leitura: i + 1,
          id_sensor: 1,
          timestamp_leitura: timestamp.toISOString(),
          umidade_solo: 45 + Math.random() * 30, // 45-75%
          temperatura_ar: 18 + Math.random() * 15, // 18-33°C
          precipitacao_mm: Math.random() < 0.3 ? Math.random() * 10 : 0, // 30% chance de chuva
        });
      }

      // Alertas mock baseados nas leituras
      const mockAlertas: Alerta[] = [];
      const leituraRecente = mockLeituras[0];
      
      if (leituraRecente.umidade_solo && leituraRecente.umidade_solo < 30) {
        mockAlertas.push({
          id_alerta: 1,
          id_produtor: produtor?.id_produtor || 1,
          id_leitura: leituraRecente.id_leitura,
          id_nivel_severidade: 2,
          timestamp_alerta: new Date().toISOString(),
          descricao_alerta: 'Umidade do solo baixa detectada - considere irrigação'
        });
      }

      if (leituraRecente.temperatura_ar && leituraRecente.temperatura_ar > 35) {
        mockAlertas.push({
          id_alerta: 2,
          id_produtor: produtor?.id_produtor || 1,
          id_leitura: leituraRecente.id_leitura,
          id_nivel_severidade: 1,
          timestamp_alerta: new Date().toISOString(),
          descricao_alerta: 'Temperatura alta detectada - monitorar estresse das plantas'
        });
      }

      setSensores(mockSensores);
      setLeituras(mockLeituras);
      setAlertas(mockAlertas);

      // Salvar dados mock no AsyncStorage para persistência offline
      await AsyncStorage.setItem('sensores', JSON.stringify(mockSensores));
      await AsyncStorage.setItem('leituras', JSON.stringify(mockLeituras));
      await AsyncStorage.setItem('alertas', JSON.stringify(mockAlertas));

    } catch (error) {
      console.error('Error loading mock data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Verificar conectividade primeiro
      const online = await checkConnectivity();
      
      if (online) {
        // Tentar login via API
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email: email.toLowerCase().trim(), 
              senha: password 
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const { produtor: produtorData, propriedade: propriedadeData } = data;
            
            await AsyncStorage.setItem('produtor', JSON.stringify(produtorData));
            await AsyncStorage.setItem('propriedade', JSON.stringify(propriedadeData));
            
            setProdutor(produtorData);
            setPropriedade(propriedadeData);
            
            await loadMockData(propriedadeData.id_propriedade);
            return true;
          }
        } catch (apiError) {
          console.log('API login failed, trying offline login:', apiError);
        }
      }

      // Fallback para login offline com dados mock
      const user = mockUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase().trim() && 
        u.senha === password
      );

      if (user) {
        const nivelDegrade = mockNiveisDegrade.find(n => 
          n.id_nivel_degradacao === user.propriedade.id_nivel_degradacao
        );
        
        const propriedadeComNivel = {
          ...user.propriedade,
          nivel_degradacao: nivelDegrade
        };

        await AsyncStorage.setItem('produtor', JSON.stringify(user.produtor));
        await AsyncStorage.setItem('propriedade', JSON.stringify(propriedadeComNivel));
        
        setProdutor(user.produtor);
        setPropriedade(propriedadeComNivel);
        
        await loadMockData(user.propriedade.id_propriedade);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (produtorData: any, propriedadeData: any): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Verificar conectividade
      const online = await checkConnectivity();
      
      if (online) {
        // Tentar registro via API
        try {
          const registrationData = {
            produtor: {
              nome_completo: produtorData.nome_completo,
              cpf_cnpj: produtorData.cpf_cnpj,
              email: produtorData.email,
              telefone: produtorData.telefone,
              senha: produtorData.senha
            },
            propriedade: {
              nome_propriedade: propriedadeData.nome_propriedade,
              latitude: propriedadeData.latitude,
              longitude: propriedadeData.longitude,
              area_hectares: propriedadeData.area_hectares,
              id_nivel_degradacao: propriedadeData.id_nivel_degradacao,
              tipo_solo: propriedadeData.tipo_solo
            }
          };

          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData),
          });

          if (response.ok) {
            const data = await response.json();
            const { produtor: newProdutor, propriedade: newPropriedade } = data;
            
            await AsyncStorage.setItem('produtor', JSON.stringify(newProdutor));
            await AsyncStorage.setItem('propriedade', JSON.stringify(newPropriedade));
            
            setProdutor(newProdutor);
            setPropriedade(newPropriedade);
            
            await loadMockData(newPropriedade.id_propriedade);
            return true;
          }
        } catch (apiError) {
          console.log('API registration failed, creating offline account:', apiError);
        }
      }

      // Fallback para registro offline
      const newId = Math.floor(Math.random() * 10000) + 1000;
      
      const newProdutor: ProdutorRural = {
        id_produtor: newId,
        nome_completo: produtorData.nome_completo,
        cpf_cnpj: produtorData.cpf_cnpj,
        email: produtorData.email,
        telefone: produtorData.telefone,
        senha: produtorData.senha,
        data_cadastro: new Date().toISOString(),
      };

      const nivelDegrade = mockNiveisDegrade.find(n => 
        n.id_nivel_degradacao === propriedadeData.id_nivel_degradacao
      );

      const newPropriedade: PropriedadeRural = {
        id_propriedade: newId,
        id_produtor: newId,
        id_nivel_degradacao: propriedadeData.id_nivel_degradacao,
        nome_propriedade: propriedadeData.nome_propriedade,
        latitude: propriedadeData.latitude,
        longitude: propriedadeData.longitude,
        area_hectares: propriedadeData.area_hectares,
        data_cadastro: new Date().toISOString(),
        tipo_solo: propriedadeData.tipo_solo,
        nivel_degradacao: nivelDegrade,
      };

      await AsyncStorage.setItem('produtor', JSON.stringify(newProdutor));
      await AsyncStorage.setItem('propriedade', JSON.stringify(newPropriedade));
      
      setProdutor(newProdutor);
      setPropriedade(newPropriedade);
      
      await loadMockData(newPropriedade.id_propriedade);
      
      // Salvar para sincronização posterior quando online
      await AsyncStorage.setItem('pendingRegistration', JSON.stringify({
        produtorData,
        propriedadeData,
        timestamp: new Date().toISOString()
      }));

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
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
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProdutor = async (produtorData: Partial<ProdutorRural>): Promise<void> => {
    try {
      if (produtor) {
        const updatedProdutor = { ...produtor, ...produtorData };
        await AsyncStorage.setItem('produtor', JSON.stringify(updatedProdutor));
        setProdutor(updatedProdutor);

        // Marcar para sincronização quando online
        await AsyncStorage.setItem('pendingUpdates', JSON.stringify({
          type: 'produtor',
          data: produtorData,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Update produtor error:', error);
    }
  };

  const getDashboardMetrics = async (): Promise<any> => {
    try {
      // Calcular métricas baseadas nos dados offline
      if (!propriedade) return null;

      const area = propriedade.area_hectares;
      const nivelDegradacao = propriedade.nivel_degradacao?.nivel_numerico || 1;
      
      // Cálculos realistas baseados na área e nível de degradação
      const baseWaterUsage = area * 45; // ~45L por hectare base
      const degradationMultiplier = 1 + (nivelDegradacao - 1) * 0.2; // Mais degradado = mais água necessária
      
      const waterUsage = Math.floor(baseWaterUsage * degradationMultiplier);
      const savings = Math.floor(area * 25 * (6 - nivelDegradacao) / 5); // Economia baseada na saúde do solo
      const efficiency = Math.max(60, 95 - (nivelDegradacao - 1) * 8); // Eficiência diminui com degradação
      
      return {
        waterUsage,
        savings,
        efficiency,
        alerts: alertas.length,
        soilHealth: propriedade.nivel_degradacao?.descricao_degradacao || 'Bom',
        sensorsActive: sensores.length,
        lastReading: leituras.length > 0 ? leituras[0].timestamp_leitura : null,
        isOffline: !isOnline
      };
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      return null;
    }
  };

  const getRecentAlerts = async (): Promise<Alerta[]> => {
    try {
      // Tentar carregar alertas salvos offline
      const savedAlertas = await AsyncStorage.getItem('alertas');
      if (savedAlertas) {
        const alertasData = JSON.parse(savedAlertas);
        setAlertas(alertasData);
        return alertasData;
      }
      return alertas;
    } catch (error) {
      console.error('Error loading alerts:', error);
      return alertas;
    }
  };

  const getSensorReadings = async (): Promise<LeituraSensor[]> => {
    try {
      // Tentar carregar leituras salvas offline
      const savedLeituras = await AsyncStorage.getItem('leituras');
      if (savedLeituras) {
        const leiturasData = JSON.parse(savedLeituras);
        setLeituras(leiturasData);
        return leiturasData;
      }
      return leituras;
    } catch (error) {
      console.error('Error loading sensor readings:', error);
      return leituras;
    }
  };

  const quickLogin = async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Usar dados do primeiro usuário mock
      const user = mockUsers[0];
      const nivelDegrade = mockNiveisDegrade.find(n => 
        n.id_nivel_degradacao === user.propriedade.id_nivel_degradacao
      );
      
      const propriedadeComNivel = {
        ...user.propriedade,
        nivel_degradacao: nivelDegrade
      };

      await AsyncStorage.setItem('produtor', JSON.stringify(user.produtor));
      await AsyncStorage.setItem('propriedade', JSON.stringify(propriedadeComNivel));
      
      setProdutor(user.produtor);
      setPropriedade(propriedadeComNivel);
      
      await loadMockData(user.propriedade.id_propriedade);
      return true;
    } catch (error) {
      console.error('Quick login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const syncData = async (): Promise<void> => {
    try {
      const online = await checkConnectivity();
      if (!online) return;

      // Sincronizar dados pendentes quando voltar online
      const pendingRegistration = await AsyncStorage.getItem('pendingRegistration');
      const pendingUpdates = await AsyncStorage.getItem('pendingUpdates');

      if (pendingRegistration) {
        // Tentar sincronizar registro pendente
        // Implementar lógica de sincronização aqui
        console.log('Syncronizing pending registration...');
      }

      if (pendingUpdates) {
        // Tentar sincronizar atualizações pendentes
        // Implementar lógica de sincronização aqui
        console.log('Syncronizing pending updates...');
      }

    } catch (error) {
      console.error('Sync error:', error);
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
    quickLogin,
    loading,
    syncData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};