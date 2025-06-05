import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SensorsScreenProps {
  navigation: any;
}

interface SensorData {
  id: number;
  name: string;
  model: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  battery: number;
  lastReading: {
    value: number;
    unit: string;
    timestamp: string;
  };
  location: string;
  alertsEnabled: boolean;
  minThreshold?: number;
  maxThreshold?: number;
  icon: string;
  color: string;
}

const SensorsScreen: React.FC<SensorsScreenProps> = ({ navigation }) => {
  const { 
    produtor, 
    propriedade, 
    sensores, 
    leituras, 
    isOnline 
  } = useAuth();
  
  const insets = useSafeAreaInsets();
  const [sensorsData, setSensorsData] = useState<SensorData[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [configModalVisible, setConfigModalVisible] = useState(false);

  useEffect(() => {
    generateSensorsData();
  }, [sensores, leituras]);

  const generateSensorsData = () => {
    // Gerar dados de sensores baseados nos dados mock
    const mockSensorsData: SensorData[] = [
      {
        id: 1,
        name: 'Sensor de Umidade do Solo',
        model: 'DHT22-WaterWise',
        type: 'Umidade/Temperatura',
        status: Math.random() > 0.1 ? 'online' : 'warning',
        battery: Math.floor(70 + Math.random() * 30),
        lastReading: {
          value: leituras[0]?.umidade_solo || 45 + Math.random() * 30,
          unit: '%',
          timestamp: leituras[0]?.timestamp_leitura || new Date().toISOString(),
        },
        location: 'Setor A - Norte',
        alertsEnabled: true,
        minThreshold: 30,
        maxThreshold: 80,
        icon: 'water-outline',
        color: '#2196F3',
      },
      {
        id: 2,
        name: 'Sensor de Temperatura',
        model: 'Soil-Moisture-Pro',
        type: 'Temperatura',
        status: Math.random() > 0.1 ? 'online' : 'offline',
        battery: Math.floor(60 + Math.random() * 40),
        lastReading: {
          value: leituras[0]?.temperatura_ar || 18 + Math.random() * 15,
          unit: '°C',
          timestamp: leituras[0]?.timestamp_leitura || new Date().toISOString(),
        },
        location: 'Setor B - Centro',
        alertsEnabled: true,
        minThreshold: 15,
        maxThreshold: 35,
        icon: 'thermometer-outline',
        color: '#FF9800',
      },
      {
        id: 3,
        name: 'Pluviômetro',
        model: 'Rain-Gauge-Smart',
        type: 'Precipitação',
        status: Math.random() > 0.15 ? 'online' : 'warning',
        battery: Math.floor(80 + Math.random() * 20),
        lastReading: {
          value: leituras[0]?.precipitacao_mm || Math.random() * 10,
          unit: 'mm',
          timestamp: leituras[0]?.timestamp_leitura || new Date().toISOString(),
        },
        location: 'Setor C - Sul',
        alertsEnabled: false,
        minThreshold: 0,
        maxThreshold: 50,
        icon: 'rainy-outline',
        color: '#4CAF50',
      },
    ];

    setSensorsData(mockSensorsData);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddSensor = () => {
    if (!isOnline) {
      Alert.alert(
        'Modo Offline',
        'Adicionar novos sensores não está disponível offline. Conecte-se à internet para configurar novos dispositivos.'
      );
      return;
    }

    Alert.alert('Em Desenvolvimento', 'Adicionar novos sensores estará disponível em breve.');
  };

  const handleSensorSettings = (sensor: SensorData) => {
    setSelectedSensor(sensor);
    setConfigModalVisible(true);
  };

  const handleToggleAlerts = (sensorId: number, enabled: boolean) => {
    setSensorsData(prev => 
      prev.map(sensor => 
        sensor.id === sensorId 
          ? { ...sensor, alertsEnabled: enabled }
          : sensor
      )
    );
  };

  const handleCalibrateAll = () => {
    if (!isOnline) {
      Alert.alert(
        'Modo Offline',
        'Calibração de sensores não está disponível offline. Conecte-se à internet para calibrar os dispositivos.'
      );
      return;
    }

    Alert.alert(
      'Calibrar Todos os Sensores',
      'Isso iniciará o processo de calibração para todos os sensores ativos. O processo pode levar alguns minutos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => {
          Alert.alert('Em Desenvolvimento', 'Calibração automática estará disponível em breve.');
        }}
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'offline': return '#F44336';
      default: return '#888888';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'warning': return 'Atenção';
      case 'offline': return 'Offline';
      default: return 'Desconhecido';
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return '#4CAF50';
    if (battery > 20) return '#FF9800';
    return '#F44336';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      
      if (minutes < 60) {
        return `${minutes}min atrás`;
      } else if (minutes < 1440) {
        const hours = Math.floor(minutes / 60);
        return `${hours}h atrás`;
      } else {
        return date.toLocaleDateString('pt-BR');
      }
    } catch (error) {
      return 'Erro na data';
    }
  };

  const SensorCard = ({ sensor }: { sensor: SensorData }) => (
    <View style={styles.sensorCard}>
      <LinearGradient
        colors={['#2D2D2D', '#3D3D3D']}
        style={styles.sensorCardGradient}
      >
        <View style={styles.sensorCardHeader}>
          <View style={styles.sensorIconContainer}>
            <View style={[styles.sensorIcon, { backgroundColor: sensor.color + '20' }]}>
              <Ionicons name={sensor.icon as any} size={24} color={sensor.color} />
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(sensor.status) }]} />
          </View>
          
          <View style={styles.sensorInfo}>
            <Text style={styles.sensorName}>{sensor.name}</Text>
            <Text style={styles.sensorModel}>{sensor.model}</Text>
            <Text style={styles.sensorLocation}>{sensor.location}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => handleSensorSettings(sensor)}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.sensorCardBody}>
          <View style={styles.sensorReading}>
            <Text style={styles.readingLabel}>Última Leitura</Text>
            <View style={styles.readingValueContainer}>
              <Text style={[styles.readingValue, { color: sensor.color }]}>
                {sensor.lastReading.value.toFixed(1)}
              </Text>
              <Text style={styles.readingUnit}>{sensor.lastReading.unit}</Text>
            </View>
            <Text style={styles.readingTime}>
              {formatTimestamp(sensor.lastReading.timestamp)}
            </Text>
          </View>

          <View style={styles.sensorStats}>
            <View style={styles.statItem}>
              <View style={styles.statRow}>
                <Ionicons name="radio-outline" size={16} color={getStatusColor(sensor.status)} />
                <Text style={[styles.statLabel, { color: getStatusColor(sensor.status) }]}>
                  {getStatusText(sensor.status)}
                </Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statRow}>
                <Ionicons name="battery-half-outline" size={16} color={getBatteryColor(sensor.battery)} />
                <Text style={[styles.statLabel, { color: getBatteryColor(sensor.battery) }]}>
                  {sensor.battery}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sensorControls}>
            <View style={styles.alertToggle}>
              <Text style={styles.alertToggleLabel}>Alertas</Text>
              <Switch
                value={sensor.alertsEnabled}
                onValueChange={(value) => handleToggleAlerts(sensor.id, value)}
                trackColor={{ false: '#3D3D3D', true: sensor.color }}
                thumbColor="#FFFFFF"
                style={styles.switch}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const ConfigModal = () => {
    if (!selectedSensor) return null;

    const [minThreshold, setMinThreshold] = useState(String(selectedSensor.minThreshold || 0));
    const [maxThreshold, setMaxThreshold] = useState(String(selectedSensor.maxThreshold || 100));

    const handleSaveConfig = () => {
      if (!isOnline) {
        Alert.alert(
          'Modo Offline',
          'Configurações não podem ser salvas offline. Conecte-se à internet para salvar as alterações.'
        );
        return;
      }

      setSensorsData(prev =>
        prev.map(sensor =>
          sensor.id === selectedSensor.id
            ? {
                ...sensor,
                minThreshold: parseFloat(minThreshold) || 0,
                maxThreshold: parseFloat(maxThreshold) || 100,
              }
            : sensor
        )
      );

      setConfigModalVisible(false);
      Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={configModalVisible}
        onRequestClose={() => setConfigModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#2D2D2D', '#3D3D3D']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Configurar Sensor</Text>
                <TouchableOpacity
                  onPress={() => setConfigModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.sensorInfoModal}>
                  <View style={[styles.sensorIconModal, { backgroundColor: selectedSensor.color + '20' }]}>
                    <Ionicons name={selectedSensor.icon as any} size={32} color={selectedSensor.color} />
                  </View>
                  <View>
                    <Text style={styles.sensorNameModal}>{selectedSensor.name}</Text>
                    <Text style={styles.sensorModelModal}>{selectedSensor.model}</Text>
                  </View>
                </View>

                <View style={styles.configSection}>
                  <Text style={styles.configSectionTitle}>Limites de Alerta</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Valor Mínimo</Text>
                    <TextInput
                      style={styles.input}
                      value={minThreshold}
                      onChangeText={setMinThreshold}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#888888"
                    />
                    <Text style={styles.inputUnit}>{selectedSensor.lastReading.unit}</Text>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Valor Máximo</Text>
                    <TextInput
                      style={styles.input}
                      value={maxThreshold}
                      onChangeText={setMaxThreshold}
                      keyboardType="numeric"
                      placeholder="100"
                      placeholderTextColor="#888888"
                    />
                    <Text style={styles.inputUnit}>{selectedSensor.lastReading.unit}</Text>
                  </View>
                </View>

                <View style={styles.configSection}>
                  <Text style={styles.configSectionTitle}>Ações Rápidas</Text>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      if (!isOnline) {
                        Alert.alert('Modo Offline', 'Calibração não disponível offline.');
                        return;
                      }
                      Alert.alert('Em Desenvolvimento', 'Calibração estará disponível em breve.');
                    }}
                  >
                    <Ionicons name="build-outline" size={20} color="#00FFCC" />
                    <Text style={styles.actionButtonText}>Calibrar Sensor</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      if (!isOnline) {
                        Alert.alert('Modo Offline', 'Teste não disponível offline.');
                        return;
                      }
                      Alert.alert('Teste Iniciado', 'Verificando conexão e funcionamento do sensor...');
                    }}
                  >
                    <Ionicons name="flash-outline" size={20} color="#FF9800" />
                    <Text style={styles.actionButtonText}>Testar Conexão</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={() => {
                      Alert.alert(
                        'Remover Sensor',
                        'Tem certeza que deseja remover este sensor? Esta ação não pode ser desfeita.',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { 
                            text: 'Remover', 
                            style: 'destructive',
                            onPress: () => {
                              if (!isOnline) {
                                Alert.alert('Modo Offline', 'Remoção não disponível offline.');
                                return;
                              }
                              Alert.alert('Em Desenvolvimento', 'Remoção de sensores estará disponível em breve.');
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                    <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Remover Sensor</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setConfigModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveConfig}
                >
                  <LinearGradient
                    colors={['#00FFCC', '#00D4AA']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    );
  };

  const NetworkStatus = () => (
    <View style={styles.networkStatus}>
      <LinearGradient
        colors={['#2D2D2D', '#3D3D3D']}
        style={styles.networkStatusGradient}
      >
        <View style={styles.networkStatusHeader}>
          <Ionicons name="wifi-outline" size={20} color={isOnline ? '#4CAF50' : '#F44336'} />
          <Text style={styles.networkStatusTitle}>Status da Rede</Text>
        </View>
        
        <View style={styles.networkStatusContent}>
          <View style={styles.networkStatusItem}>
            <Text style={styles.networkStatusLabel}>Conexão:</Text>
            <Text style={[styles.networkStatusValue, { color: isOnline ? '#4CAF50' : '#F44336' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          
          <View style={styles.networkStatusItem}>
            <Text style={styles.networkStatusLabel}>Sensores Ativos:</Text>
            <Text style={styles.networkStatusValue}>
              {sensorsData.filter(s => s.status === 'online').length}/{sensorsData.length}
            </Text>
          </View>
          
          <View style={styles.networkStatusItem}>
            <Text style={styles.networkStatusLabel}>Última Sincronização:</Text>
            <Text style={styles.networkStatusValue}>
              {isOnline ? 'Agora' : 'Dados offline'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sensores IoT</Text>
          <TouchableOpacity onPress={handleAddSensor} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#00FFCC" />
          </TouchableOpacity>
        </View>

        {/* Offline Notice */}
        {!isOnline && (
          <View style={styles.offlineNotice}>
            <Ionicons name="cloud-offline-outline" size={16} color="#FF9800" />
            <Text style={styles.offlineNoticeText}>
              Modo offline • Algumas funcionalidades limitadas
            </Text>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Property Info */}
          <View style={styles.section}>
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName}>{propriedade?.nome_propriedade}</Text>
              <Text style={styles.propertyDetails}>
                {sensorsData.length} sensores instalados
              </Text>
            </View>
          </View>

          {/* Network Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conectividade</Text>
            <NetworkStatus />
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction} onPress={handleCalibrateAll}>
                <LinearGradient
                  colors={['#2D2D2D', '#3D3D3D']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="build-outline" size={24} color="#00FFCC" />
                  <Text style={styles.quickActionText}>Calibrar Todos</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => {
                  if (!isOnline) {
                    Alert.alert('Modo Offline', 'Sincronização não disponível offline.');
                    return;
                  }
                  Alert.alert('Sincronizando', 'Atualizando dados dos sensores...');
                }}
              >
                <LinearGradient
                  colors={['#2D2D2D', '#3D3D3D']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="sync-outline" size={24} color="#4CAF50" />
                  <Text style={styles.quickActionText}>Sincronizar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sensors List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dispositivos</Text>
            <View style={styles.sensorsList}>
              {sensorsData.map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} />
              ))}
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        <ConfigModal />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineNoticeText: {
    color: '#FF9800',
    fontSize: 12,
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  propertyInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  propertyDetails: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  networkStatus: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  networkStatusGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  networkStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  networkStatusTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  networkStatusContent: {
    gap: 8,
  },
  networkStatusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkStatusLabel: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  networkStatusValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  sensorsList: {
    gap: 16,
  },
  sensorCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sensorCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  sensorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sensorIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  sensorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2D2D2D',
  },
  sensorInfo: {
    flex: 1,
  },
  sensorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sensorModel: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 2,
  },
  sensorLocation: {
    color: '#888888',
    fontSize: 10,
  },
  settingsButton: {
    padding: 8,
  },
  sensorCardBody: {
    gap: 12,
  },
  sensorReading: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
  readingLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 4,
  },
  readingValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  readingValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  readingUnit: {
    color: '#CCCCCC',
    fontSize: 14,
    marginLeft: 4,
  },
  readingTime: {
    color: '#888888',
    fontSize: 10,
    marginTop: 4,
  },
  sensorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  sensorControls: {
    borderTopWidth: 1,
    borderTopColor: '#3D3D3D',
    paddingTop: 12,
  },
  alertToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertToggleLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 20,
  },
  sensorInfoModal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
  },
  sensorIconModal: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sensorNameModal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sensorModelModal: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  configSection: {
    marginBottom: 24,
  },
  configSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    width: 100,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    marginHorizontal: 8,
  },
  inputUnit: {
    color: '#CCCCCC',
    fontSize: 12,
    width: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#3D3D3D',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});

export default SensorsScreen;