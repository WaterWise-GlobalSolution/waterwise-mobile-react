import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces baseadas na estrutura do banco de dados
interface ProdutorRural {
  id_produtor: number;
  nome_completo: string;
  cpf_cnpj: string;
  email: string;
  telefone?: string;
  data_cadastro: string;
  status_ativo: string;
}

interface PropriedadeRural {
  id_propriedade: number;
  id_produtor: number;
  nome_propriedade: string;
  latitude: number;
  longitude: number;
  area_hectares: number;
  tipo_solo?: string;
  id_nivel_degradacao: number;
  data_cadastro: string;
}

interface AuthContextType {
  produtor: ProdutorRural | null;
  propriedade: PropriedadeRural | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (produtorData: any, propriedadeData: any) => Promise<boolean>;
  updateProdutor: (produtorData: Partial<ProdutorRural>) => Promise<void>;
  quickLogin: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuration for API
const API_BASE_URL = 'https://your-waterwise-api.azurewebsites.net/api'; // Substitua pela URL da sua API

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [produtor, setProdutor] = useState<ProdutorRural | null>(null);
  const [propriedade, setPropriedade] = useState<PropriedadeRural | null>(null);
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
        setPropriedade(JSON.parse(propriedadeData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
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
      
      const registrationData = {
        produtor: {
          nome_completo: produtorData.nome_completo,
          cpf_cnpj: produtorData.cpf_cnpj,
          email: produtorData.email,
          telefone: produtorData.telefone,
          senha: produtorData.senha, // Será hasheada no backend
          status_ativo: 'S'
        },
        propriedade: {
          nome_propriedade: propriedadeData.nome_propriedade,
          latitude: propriedadeData.latitude,
          longitude: propriedadeData.longitude,
          area_hectares: propriedadeData.area_hectares,
          tipo_solo: propriedadeData.tipo_solo,
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
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProdutor = async (produtorData: Partial<ProdutorRural>): Promise<void> => {
    try {
      if (produtor) {
        // Atualizar no servidor
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

  const quickLogin = async (): Promise<boolean> => {
    try {
      // Mock data para desenvolvimento - REMOVER EM PRODUÇÃO
      const mockProdutor: ProdutorRural = {
        id_produtor: 1,
        nome_completo: 'João Silva',
        cpf_cnpj: '12345678901',
        email: 'joao@waterwise.com',
        telefone: '11999999999',
        data_cadastro: new Date().toISOString(),
        status_ativo: 'S',
      };

      const mockPropriedade: PropriedadeRural = {
        id_propriedade: 1,
        id_produtor: 1,
        nome_propriedade: 'Fazenda São João',
        latitude: -23.5505,
        longitude: -46.6333,
        area_hectares: 50.5,
        tipo_solo: 'Latossolo',
        id_nivel_degradacao: 2,
        data_cadastro: new Date().toISOString(),
      };

      await AsyncStorage.setItem('produtor', JSON.stringify(mockProdutor));
      await AsyncStorage.setItem('propriedade', JSON.stringify(mockPropriedade));
      
      setProdutor(mockProdutor);
      setPropriedade(mockPropriedade);
      
      return true;
    } catch (error) {
      console.error('Quick login error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    produtor,
    propriedade,
    isAuthenticated: !!produtor,
    login,
    logout,
    register,
    updateProdutor,
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