// src/utils/DebugHelper.tsx - Helper para localizar erros de Text
import React from 'react';
import { Text } from 'react-native';

// Componente de Text seguro que sempre converte para string
export const SafeText: React.FC<{ children: any; style?: any; [key: string]: any }> = ({ 
  children, 
  style, 
  ...props 
}) => {
  // Função para converter qualquer valor em string segura
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Se children é um array, processar cada item
  if (Array.isArray(children)) {
    const safeChildren = children.map((child, index) => {
      if (React.isValidElement(child)) return child;
      return safeString(child);
    });
    return <Text style={style} {...props}>{safeChildren}</Text>;
  }

  // Se children é um elemento React, retornar como está
  if (React.isValidElement(children)) {
    return <Text style={style} {...props}>{children}</Text>;
  }

  // Converter para string segura
  const safeValue = safeString(children);
  
  // Log para debug em desenvolvimento
  if (__DEV__ && (children === null || children === undefined)) {
    console.warn('⚠️ SafeText: Valor null/undefined detectado:', { children, safeValue });
  }

  return <Text style={style} {...props}>{safeValue}</Text>;
};

// Hook para validar dados antes de renderizar
export const useSafeData = () => {
  const validateForText = (value: any, fieldName?: string): string => {
    if (value === null || value === undefined) {
      if (__DEV__ && fieldName) {
        console.warn(`⚠️ Campo ${fieldName} é null/undefined`);
      }
      return '';
    }
    
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    
    if (__DEV__ && fieldName) {
      console.warn(`⚠️ Campo ${fieldName} não é string/number/boolean:`, typeof value, value);
    }
    
    return String(value);
  };

  const validateObject = (obj: any, objName?: string) => {
    if (!obj) return {};
    
    const validated: any = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        validated[key] = value;
      } else if (value === null || value === undefined) {
        validated[key] = '';
        if (__DEV__) {
          console.warn(`⚠️ ${objName}.${key} é null/undefined`);
        }
      } else {
        validated[key] = String(value);
        if (__DEV__) {
          console.warn(`⚠️ ${objName}.${key} convertido para string:`, typeof value, '→', String(value));
        }
      }
    });
    
    return validated;
  };

  return { validateForText, validateObject };
};

// Componente para debug de dados
export const DataDebugger: React.FC<{ data: any; label: string }> = ({ data, label }) => {
  if (!__DEV__) return null;

  const analyzeData = (obj: any, path = '') => {
    if (obj === null) return `${path}: NULL`;
    if (obj === undefined) return `${path}: UNDEFINED`;
    if (typeof obj === 'string') return `${path}: STRING "${obj}"`;
    if (typeof obj === 'number') return `${path}: NUMBER ${obj}`;
    if (typeof obj === 'boolean') return `${path}: BOOLEAN ${obj}`;
    if (Array.isArray(obj)) return `${path}: ARRAY[${obj.length}]`;
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      return `${path}: OBJECT{${keys.join(', ')}}`;
    }
    return `${path}: ${typeof obj}`;
  };

  const analysis = analyzeData(data, label);
  console.log(`🔍 DataDebugger: ${analysis}`);

  return null;
};

// Wrapper para componentes que podem ter problemas de Text
export const withSafeText = <P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> => {
  return (props: P) => {
    try {
      return <Component {...props} />;
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Erro em componente:', error);
        console.error('Props do componente:', props);
      }
      
      if (error.message?.includes('Text strings must be rendered within a <Text> component')) {
        console.error('🚨 ERRO TEXT DETECTADO no componente:', Component.name);
        // Retornar componente de fallback
        return (
          <SafeText style={{ color: 'red', fontSize: 12 }}>
            Erro: {Component.name}
          </SafeText>
        );
      }
      
      throw error;
    }
  };
};

// Utilitários para debugging específico
export const DebugUtils = {
  // Verificar se um valor pode ser renderizado como texto
  isTextSafe: (value: any): boolean => {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      React.isValidElement(value)
    );
  },

  // Converter valor para formato seguro para Text
  makeTextSafe: (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    return String(value);
  },

  // Log detalhado de props suspeitas
  logSuspiciousProps: (props: any, componentName: string) => {
    if (!__DEV__) return;

    Object.keys(props).forEach(key => {
      const value = props[key];
      if (!DebugUtils.isTextSafe(value) && value !== null && value !== undefined) {
        console.warn(`🚨 ${componentName}.${key} pode causar erro Text:`, typeof value, value);
      }
    });
  },

  // Verificar estrutura de dados do contexto
  validateContextData: (contextData: any, contextName: string) => {
    if (!__DEV__) return;

    console.group(`🔍 Validando ${contextName}`);
    
    Object.keys(contextData).forEach(key => {
      const value = contextData[key];
      console.log(`${key}:`, typeof value, value);
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        console.group(`${key} (object)`);
        Object.keys(value).forEach(subKey => {
          const subValue = value[subKey];
          console.log(`  ${subKey}:`, typeof subValue, subValue);
        });
        console.groupEnd();
      }
    });
    
    console.groupEnd();
  }
};

export default SafeText;
