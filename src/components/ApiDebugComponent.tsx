// src/components/ApiDebugComponent.tsx - Componente de Debug para Desenvolvimento
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ApiDebugHelper, { DebugResult } from '../utils/ApiDebugHelper';
import { ApiTestUtils, apiService } from '../services/ApiEndpoints';

interface ApiDebugComponentProps {
  visible?: boolean;
  onClose?: () => void;
}

const ApiDebugComponent: React.FC<ApiDebugComponentProps> = ({ 
  visible = false, 
  onClose 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const [quickTestResult, setQuickTestResult] = useState<any>(null);

  useEffect(() => {
    if (visible && __DEV__) {
      runQuickDiagnostic();
    }
  }, [visible]);

  const runQuickDiagnostic = async () => {
    setIsRunning(true);
    try {
      console.log('🔍 Executando diagnóstico rápido da API...');
      
      // Teste rápido de conectividade
      const connectionTest = await ApiTestUtils.testConnection();
      setQuickTestResult(connectionTest);
      
      console.log('✅ Diagnóstico rápido concluído');
    } catch (error) {
      console.error('❌ Erro no diagnóstico rápido:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runFullDiagnostic = async () => {
    setIsRunning(true);
    try {
      console.log('🔍 Executando diagnóstico completo da API...');
      const result = await ApiDebugHelper.runDiagnostic();
      setDebugResult(result);
      console.log('✅ Diagnóstico completo concluído');
    } catch (error) {
      console.error('❌ Erro no diagnóstico completo:', error);
      Alert.alert('Erro', 'Falha ao executar diagnóstico completo');
    } finally {
      setIsRunning(false);
    }
  };

  const testSpecificEndpoint = async (endpoint: string, description: string) => {
    setIsRunning(true);
    try {
      console.log(`🧪 Testando ${description}...`);
      
      let result;
      switch (endpoint) {
        case 'login':
          result = await apiService.login({
            email: 'test@waterwise.com',
            senha: 'wrongpassword'
          });
          Alert.alert(
            'Teste de Login',
            `Status: ${result.status}\nSucesso: ${result.success}\nErro: ${result.error || 'Nenhum'}`
          );
          break;
          
        case 'niveisDegradacao':
          result = await apiService.getNiveisDegradacao({ page: 1, pageSize: 3 });
          Alert.alert(
            'Teste de Níveis de Degradação',
            `Status: ${result.status}\nSucesso: ${result.success}\nItens: ${result.data?.items?.length || 0}`
          );
          break;
          
        case 'propriedades':
          result = await apiService.getPropriedades({ page: 1, pageSize: 3 });
          Alert.alert(
            'Teste de Propriedades',
            `Status: ${result.status}\nSucesso: ${result.success}\nItens: ${result.data?.items?.length || 0}`
          );
          break;
          
        case 'health':
          result = await apiService.healthCheck();
          Alert.alert(
            'Teste de Health Check',
            `Status: ${result.status}\nSucesso: ${result.success}\nData: ${JSON.stringify(result.data)}`
          );
          break;
          
        default:
          Alert.alert('Erro', 'Endpoint não reconhecido');
      }
      
    } catch (error: any) {
      Alert.alert('Erro no Teste', error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const runCommonIssuesCheck = async () => {
    setIsRunning(true);
    try {
      const issues = await ApiDebugHelper.checkCommonIssues();
      
      const message = `
API Rodando: ${issues.apiRunning ? '✅' : '❌'}
Database Conectado: ${issues.databaseConnected ? '✅' : '❌'}
Endpoints Acessíveis: ${issues.endpointsAccessible ? '✅' : '❌'}

${issues.suggestions.length > 0 ? 'Sugestões:\n' + issues.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'Tudo parece estar funcionando!'}
      `;
      
      Alert.alert('Problemas Comuns', message);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const copyLogsToClipboard = () => {
    // Em um app real, você usaria Clipboard.setString
    Alert.alert('Info', 'Logs copiados para o console. Verifique o terminal.');
    console.log('📋 === LOGS COPIADOS ===');
    console.log('Quick Test:', quickTestResult);
    console.log('Full Diagnostic:', debugResult);
    console.log('========================');
  };

  if (!visible || !__DEV__) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A1A1A', '#2D2D2D']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🔧 API Debug Tool</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            
            {/* Status Rápido */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Status Rápido</Text>
              {quickTestResult && (
                <View style={styles.statusCard}>
                  <Text style={styles.statusText}>
                    Conectividade: {quickTestResult.connected ? '✅ Online' : '❌ Offline'}
                  </Text>
                  <Text style={styles.statusText}>
                    Latência: {quickTestResult.latency || 0}ms
                  </Text>
                  {quickTestResult.error && (
                    <Text style={styles.errorText}>
                      Erro: {quickTestResult.error}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Ações Rápidas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={runQuickDiagnostic}
                disabled={isRunning}
              >
                <Text style={styles.buttonText}>🔍 Teste Rápido</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={runFullDiagnostic}
                disabled={isRunning}
              >
                <Text style={styles.buttonText}>🔬 Diagnóstico Completo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={runCommonIssuesCheck}
                disabled={isRunning}
              >
                <Text style={styles.buttonText}>🔧 Verificar Problemas</Text>
              </TouchableOpacity>
            </View>

            {/* Testes de Endpoints */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🧪 Testes de Endpoints</Text>
              
              <TouchableOpacity
                style={styles.endpointButton}
                onPress={() => testSpecificEndpoint('health', 'Health Check')}
                disabled={isRunning}
              >
                <Text style={styles.buttonText}>❤️ Health Check</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.endpointButton}
                onPress={() => testSpecificEndpoint('login', 'Login')}
                disabled={isRunning}
              >
                <Text style={styles.buttonText}>🔑 Teste de Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.endpointButton}
                onPress={() => testSpecificEndpoint('niveisDegradacao', 'Níveis de Degradação')}
                disabled={isRunning}
              >
                <Text style={styles.buttonText}>📊 Níveis de Degradação</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.endpointButton}
                onPress={() => testSpecificEndpoint('propriedades', 'Propriedades')}
                disabled={isRunning}
              >
                <Text style={styles.buttonText}>🏡 Propriedades</Text>
              </TouchableOpacity>
            </View>

            {/* Resultado do Diagnóstico Completo */}
            {debugResult && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 Resultado Completo</Text>
                <View style={styles.resultCard}>
                  <Text style={styles.resultText}>
                    🌐 Conectividade: {debugResult.connectivity.canConnect ? '✅' : '❌'}
                  </Text>
                  <Text style={styles.resultText}>
                    ⏱️ Latência: {debugResult.connectivity.latency}ms
                  </Text>
                  <Text style={styles.resultText}>
                    📡 Endpoints OK: {Object.values(debugResult.endpoints).filter(e => e.status).length}/{Object.keys(debugResult.endpoints).length}
                  </Text>
                  
                  {debugResult.suggestions.length > 0 && (
                    <>
                      <Text style={styles.suggestionsTitle}>💡 Sugestões:</Text>
                      {debugResult.suggestions.map((suggestion, index) => (
                        <Text key={index} style={styles.suggestionText}>
                          {index + 1}. {suggestion}
                        </Text>
                      ))}
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Ações de Utilidade */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🛠️ Utilitários</Text>
              
              <TouchableOpacity
                style={styles.utilityButton}
                onPress={copyLogsToClipboard}
              >
                <Text style={styles.buttonText}>📋 Copiar Logs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.utilityButton}
                onPress={() => {
                  console.clear();
                  Alert.alert('Info', 'Console limpo');
                }}
              >
                <Text style={styles.buttonText}>🧹 Limpar Console</Text>
              </TouchableOpacity>
            </View>

            {/* Info da API */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ℹ️ Informações</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>🔗 URL: http://10.0.2.2:5072/api/v1</Text>
                <Text style={styles.infoText}>🏗️ Ambiente: {__DEV__ ? 'Development' : 'Production'}</Text>
                <Text style={styles.infoText}>📱 Plataforma: React Native</Text>
                <Text style={styles.infoText}>🕐 Timestamp: {new Date().toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Loading Overlay */}
          {isRunning && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#00FFCC" />
              <Text style={styles.loadingText}>Executando teste...</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    margin: 20,
    marginTop: 60,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#00FFCC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#2D2D2D',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#00FFCC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  endpointButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  utilityButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  resultCard: {
    backgroundColor: '#2D2D2D',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 6,
  },
  suggestionsTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  suggestionText: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  infoCard: {
    backgroundColor: '#2D2D2D',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  bottomPadding: {
    height: 40,
  },
});

export default ApiDebugComponent;
