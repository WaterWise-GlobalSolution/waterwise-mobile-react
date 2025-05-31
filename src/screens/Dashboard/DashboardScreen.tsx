import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DashboardScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { produtor, propriedade, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const [dashboardData, setDashboardData] = useState({
    waterUsage: 0,
    savings: 0,
    efficiency: 0,
    alerts: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Em produção, fazer chamada para API
      // const response = await fetch(`${API_BASE_URL}/dashboard/${propriedade?.id_propriedade}`);
      
      // Mock data baseado na propriedade
      const mockData = {
        waterUsage: Math.floor((propriedade?.area_hectares || 50) * 45), // ~45L por hectare
        savings: Math.floor((propriedade?.area_hectares || 50) * 25), // economia baseada na área
        efficiency: 85 + (propriedade?.id_nivel_degradacao ? (6 - propriedade.id_nivel_degradacao) * 3 : 0), // eficiência baseada no nível de degradação
        alerts: propriedade?.id_nivel_degradacao && propriedade.id_nivel_degradacao > 3 ? 2 : 0, // mais alertas para solos degradados
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getDegradationLevel = () => {
    const nivel = propriedade?.id_nivel_degradacao || 1;
    const levels = {
      1: { text: 'Excelente', color: '#4CAF50' },
      2: { text: 'Bom', color: '#8BC34A' },
      3: { text: 'Moderado', color: '#FF9800' },
      4: { text: 'Ruim', color: '#FF5722' },
      5: { text: 'Crítico', color: '#F44336' },
    };
    return levels[nivel as keyof typeof levels] || levels[1];
  };

  const StatCard = ({ icon, title, value, unit, color }: any) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={['#2D2D2D', '#3D3D3D']}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardHeader}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );

  const QuickActionCard = ({ icon, title, onPress, color }: any) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <LinearGradient
        colors={['#2D2D2D', '#3D3D3D']}
        style={styles.actionCardGradient}
      >
        <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const degradationLevel = getDegradationLevel();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>
              {produtor?.nome_completo?.split(' ')[0] || 'Usuário'}
            </Text>
            <Text style={styles.propertyName}>{propriedade?.nome_propriedade}</Text>
            <Text style={styles.propertyDetails}>
              {propriedade?.area_hectares?.toFixed(1)}ha • {propriedade?.tipo_solo}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleSettings} style={styles.headerButton}>
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
              <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00FFCC"
              colors={['#00FFCC']}
            />
          }
        >
          {/* Property Health Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status da Propriedade</Text>
            <View style={styles.healthCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.healthCardGradient}
              >
                <View style={styles.healthInfo}>
                  <View style={styles.healthItem}>
                    <Ionicons name="location-outline" size={20} color="#00FFCC" />
                    <Text style={styles.healthLabel}>Localização</Text>
                    <Text style={styles.healthValue}>
                      {propriedade?.latitude?.toFixed(4)}°, {propriedade?.longitude?.toFixed(4)}°
                    </Text>
                  </View>
                  <View style={styles.healthItem}>
                    <Ionicons name="leaf-outline" size={20} color={degradationLevel.color} />
                    <Text style={styles.healthLabel}>Saúde do Solo</Text>
                    <Text style={[styles.healthValue, { color: degradationLevel.color }]}>
                      {degradationLevel.text}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Water Usage Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visão Geral</Text>
            <View style={styles.statsContainer}>
              <StatCard
                icon="water-outline"
                title="Uso de Água"
                value={dashboardData.waterUsage.toLocaleString()}
                unit="L hoje"
                color="#00FFCC"
              />
              <StatCard
                icon="trending-down-outline"
                title="Economia"
                value={dashboardData.savings.toLocaleString()}
                unit="L este mês"
                color="#4CAF50"
              />
            </View>
            <View style={styles.statsContainer}>
              <StatCard
                icon="speedometer-outline"
                title="Eficiência"
                value={dashboardData.efficiency}
                unit="% média"
                color="#FF9800"
              />
              <StatCard
                icon="alert-circle-outline"
                title="Alertas"
                value={dashboardData.alerts}
                unit="ativos"
                color="#F44336"
              />
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <QuickActionCard
              icon="analytics-outline"
              title="Relatórios Detalhados"
              onPress={() => {}}
              color="#00FFCC"
            />
            <QuickActionCard
              icon="notifications-outline"
              title="Configurar Alertas"
              onPress={() => {}}
              color="#FF9800"
            />
            <QuickActionCard
              icon="map-outline"
              title="Monitorar Sensores IoT"
              onPress={() => {}}
              color="#2196F3"
            />
            <QuickActionCard
              icon="leaf-outline"
              title="Melhorar Solo"
              onPress={() => {}}
              color="#4CAF50"
            />
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Atividade Recente</Text>
            <View style={styles.activityCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.activityCardGradient}
              >
                <View style={styles.activityItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Sensor de umidade calibrado</Text>
                    <Text style={styles.activityTime}>Há 2 horas</Text>
                  </View>
                </View>
                <View style={styles.activityItem}>
                  <Ionicons name="water" size={20} color="#00FFCC" />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Irrigação otimizada no setor A</Text>
                    <Text style={styles.activityTime}>Há 4 horas</Text>
                  </View>
                </View>
                <View style={styles.activityItem}>
                  <Ionicons name="trending-up" size={20} color="#4CAF50" />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Eficiência aumentou 12%</Text>
                    <Text style={styles.activityTime}>Ontem</Text>
                  </View>
                </View>
                {dashboardData.alerts > 0 && (
                  <View style={styles.activityItem}>
                    <Ionicons name="warning" size={20} color="#FF9800" />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>
                        {propriedade?.id_nivel_degradacao && propriedade.id_nivel_degradacao > 3 
                          ? 'Solo necessita cuidados especiais' 
                          : 'Monitoramento de rotina ativo'}
                      </Text>
                      <Text style={styles.activityTime}>2 dias atrás</Text>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>
          </View>

          {/* Weather Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condições Climáticas</Text>
            <View style={styles.weatherCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.weatherCardGradient}
              >
                <View style={styles.weatherMain}>
                  <Ionicons name="partly-sunny" size={48} color="#FFB74D" />
                  <View style={styles.weatherInfo}>
                    <Text style={styles.temperature}>24°C</Text>
                    <Text style={styles.weatherDescription}>Parcialmente nublado</Text>
                    <Text style={styles.weatherLocation}>
                      Região de {propriedade?.latitude && propriedade.latitude < -20 ? 'São Paulo' : 'Brasília'}
                    </Text>
                  </View>
                </View>
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="rainy" size={16} color="#00FFCC" />
                    <Text style={styles.weatherDetailText}>Chuva: 15%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="water" size={16} color="#2196F3" />
                    <Text style={styles.weatherDetailText}>Umidade: 68%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="arrow-up" size={16} color="#FF5722" />
                    <Text style={styles.weatherDetailText}>Vento: 8 km/h</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Property Info Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados da Propriedade</Text>
            <View style={styles.propertyInfoCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.propertyInfoGradient}
              >
                <View style={styles.propertyInfoRow}>
                  <Text style={styles.propertyInfoLabel}>Nome:</Text>
                  <Text style={styles.propertyInfoValue}>{propriedade?.nome_propriedade}</Text>
                </View>
                <View style={styles.propertyInfoRow}>
                  <Text style={styles.propertyInfoLabel}>Área:</Text>
                  <Text style={styles.propertyInfoValue}>{propriedade?.area_hectares?.toFixed(1)} hectares</Text>
                </View>
                <View style={styles.propertyInfoRow}>
                  <Text style={styles.propertyInfoLabel}>Tipo de Solo:</Text>
                  <Text style={styles.propertyInfoValue}>{propriedade?.tipo_solo || 'Não informado'}</Text>
                </View>
                <View style={styles.propertyInfoRow}>
                  <Text style={styles.propertyInfoLabel}>Coordenadas:</Text>
                  <Text style={styles.propertyInfoValue}>
                    {propriedade?.latitude?.toFixed(6)}°, {propriedade?.longitude?.toFixed(6)}°
                  </Text>
                </View>
                <View style={styles.propertyInfoRow}>
                  <Text style={styles.propertyInfoLabel}>Proprietário:</Text>
                  <Text style={styles.propertyInfoValue}>{produtor?.nome_completo}</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '400',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  propertyName: {
    color: '#00FFCC',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  propertyDetails: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  healthCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  healthCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 16,
  },
  healthInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthItem: {
    alignItems: 'center',
    flex: 1,
  },
  healthLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  healthValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 16,
  },
  statCardHeader: {
    marginBottom: 8,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statUnit: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 8,
  },
  statTitle: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  activityCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '400',
  },
  weatherCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  weatherCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherInfo: {
    marginLeft: 16,
  },
  temperature: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  weatherDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
  },
  weatherLocation: {
    color: '#00FFCC',
    fontSize: 12,
    fontWeight: '500',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 4,
  },
  propertyInfoCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  propertyInfoGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  propertyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyInfoLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
  },
  propertyInfoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
});

export default DashboardScreen;