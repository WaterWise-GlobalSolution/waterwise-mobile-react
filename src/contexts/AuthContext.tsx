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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (produtorData: any, propriedadeData: any) => Promise<boolean>;
  updateProdutor: (produtorData: Partial<ProdutorRural>) => Promise<void>;
  getDashboardMetrics: () => Promise<any>;
  getRecentAlerts: () => Promise<Alerta[]>;
  getSensorReadings: () => Promise<LeituraSensor[]>;
  quickLogin: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuration for API - deve apontar para sua API .NET ou Java
const API_BASE_URL = 'https://waterwise-api.azurewebsites.net/api'; // Substitua pela URL da sua API

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [produtor, setProdutor] = useState<ProdutorRural | null>(null);
  const [propriedade, setPropriedade] = useState<PropriedadeRural | null>(null);
  const [sensores, setSensores] = useState<SensorIot[]>([]);
  const [leituras, setLeituras] = useState<LeituraSensor[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const produtorData = await AsyncStorage.getItem('produtor');
      const propriedadeData = await AsyncStorage.getItem('propriedade');
      
      if (produtorData) {
        setProdutor(JSON.parse(produtorData));
      }
      
      if (propriedadeData) {
        const prop = JSON.parse(propriedadeData);
        setPropriedade(prop);
        
        // Carregar dados relacionados se autenticado
        if (produtorData) {
          await loadRelatedData(prop.id_propriedade);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = async (idPropriedade: number) => {
    try {
      // Carregar sensores, leituras e alertas da propriedade
      await Promise.all([
        loadSensores(idPropriedade),
        loadRecentReadings(idPropriedade),
        loadRecentAlerts()
      ]);
    } catch (error) {
      console.error('Error loading related data:', error);
    }
  };

  const loadSensores = async (idPropriedade: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sensores/propriedade/${idPropriedade}`);
      if (response.ok) {
        const sensoresData = await response.json();
        setSensores(sensoresData);
      }
    } catch (error) {
      console.error('Error loading sensores:', error);
      // Mock data para desenvolvimento
      setSensores([
        {
          id_sensor: 1,
          id_propriedade: idPropriedade,
          id_tipo_sensor: 1,
          modelo_dispositivo: 'DHT22-WaterWise',
          data_instalacao: new Date().toISOString()
        }
      ]);
    }
  };

  const loadRecentReadings = async (idPropriedade: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leituras/propriedade/${idPropriedade}/recentes`);
      if (response.ok) {
        const leiturasData = await response.json();
        setLeituras(leiturasData);
      }
    } catch (error) {
      console.error('Error loading readings:', error);
      // Mock data para desenvolvimento
      setLeituras([
        {
          id_leitura: 1,
          id_sensor: 1,
          timestamp_leitura: new Date().toISOString(),
          umidade_solo: 65.5,
          temperatura_ar: 24.8,
          precipitacao_mm: 2.3
        }
      ]);
    }
  };

  const loadRecentAlerts = async () => {
    try {
      if (!produtor) return;
      
      const response = await fetch(`${API_BASE_URL}/alertas/produtor/${produtor.id_produtor}/recentes`);
      if (response.ok) {
        const alertasData = await response.json();
        setAlertas(alertasData);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      // Mock data para desenvolvimento
      setAlertas([
        {
          id_alerta: 1,
          id_produtor: 1,
          id_leitura: 1,
          id_nivel_severidade: 2,
          timestamp_alerta: new Date().toISOString(),
          descricao_alerta: 'Umidade do solo abaixo do recomendado'
        }
      ]);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
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
        
        // Carregar dados relacionados
        await loadRelatedData(propriedadeData.id_propriedade);
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login error:', errorData);
        return false;
      }
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
      
      // Preparar dados para o formato do banco Oracle
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
          id_nivel_degradacao: propriedadeData.id_nivel_degradacao
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
        
        // Carregar dados relacionados
        await loadRelatedData(newPropriedade.id_propriedade);
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Registration error:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('produtor');
      await AsyncStorage.removeItem('propriedade');
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
        const response = await fetch(`${API_BASE_URL}/produtor/${produtor.id_produtor}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(produtorData),
        });

        if (response.ok) {
          const updatedProdutor = { ...produtor, ...produtorData };
          await AsyncStorage.setItem('produtor', JSON.stringify(updatedProdutor));
          setProdutor(updatedProdutor);
        }
      }
    } catch (error) {
      console.error('Update produtor error:', error);
    }
  };

  const getDashboardMetrics = async (): Promise<any> => {
    try {
      if (!propriedade) return null;

      const response = await fetch(`${API_BASE_URL}/dashboard/${propriedade.id_propriedade}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Dashboard metrics error:', error);
    }

    // Mock data baseado na estrutura do banco
    return {
      waterUsage: Math.floor((propriedade?.area_hectares || 50) * 45), // ~45L por hectare
      savings: Math.floor((propriedade?.area_hectares || 50) * 25), // economia baseada na área
      efficiency: 85 + (propriedade?.id_nivel_degradacao ? (6 - propriedade.id_nivel_degradacao) * 3 : 0),
      alerts: propriedade?.id_nivel_degradacao && propriedade.id_nivel_degradacao > 3 ? 2 : 0,
      soilHealth: propriedade?.nivel_degradacao?.descricao_degradacao || 'Bom',
      sensorsActive: sensores.length,
      lastReading: leituras.length > 0 ? leituras[0].timestamp_leitura : null
    };
  };

  const getRecentAlerts = async (): Promise<Alerta[]> => {
    await loadRecentAlerts();
    return alertas;
  };

  const getSensorReadings = async (): Promise<LeituraSensor[]> => {
    if (propriedade) {
      await loadRecentReadings(propriedade.id_propriedade);
    }
    return leituras;
  };

  const quickLogin = async (): Promise<boolean> => {
    try {
      // Mock data para desenvolvimento - baseado na estrutura Oracle
      const mockProdutor: ProdutorRural = {
        id_produtor: 1,
        nome_completo: 'João Silva Santos',
        cpf_cnpj: '123.456.789-10',
        email: 'joao.silva@waterwise.com',
        telefone: '11999999999',
        senha: 'joao123',
        data_cadastro: new Date().toISOString(),
      };

      const mockPropriedade: PropriedadeRural = {
        id_propriedade: 1,
        id_produtor: 1,
        id_nivel_degradacao: 2,
        nome_propriedade: 'Fazenda São João',
        latitude: -23.5505199,
        longitude: -46.6333094,
        area_hectares: 150.75,
        data_cadastro: new Date().toISOString(),
        nivel_degradacao: {
          id_nivel_degradacao: 2,
          codigo_degradacao: 'BOM',
          descricao_degradacao: 'Solo em bom estado com sinais mínimos de degradação',
          nivel_numerico: 2,
          acoes_corretivas: 'Implementar rotação de culturas'
        }
      };

      await AsyncStorage.setItem('produtor', JSON.stringify(mockProdutor));
      await AsyncStorage.setItem('propriedade', JSON.stringify(mockPropriedade));
      
      setProdutor(mockProdutor);
      setPropriedade(mockPropriedade);
      
      // Carregar dados relacionados mock
      await loadRelatedData(mockPropriedade.id_propriedade);
      
      return true;
    } catch (error) {
      console.error('Quick login error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    produtor,
    propriedade,
    sensores,
    leituras,
    alertas,
    isAuthenticated: !!produtor,
    login,
    logout,
    register,
    updateProdutor,
    getDashboardMetrics,
    getRecentAlerts,
    getSensorReadings,
    quickLogin,
    loading,
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