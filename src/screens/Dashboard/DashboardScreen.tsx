// src/screens/Dashboard/DashboardScreen.tsx - VERSÃO COM DEBUG
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import ApiDebugComponent from '../../components/ApiDebugComponent';
import ApiDebugHelper from '../../utils/ApiDebugHelper';

interface DashboardScreenProps {
  navigation: any;
}

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  feelsLike: number;
  rainProbability: number;
  location: string;
  icon: string;
  isLoading: boolean;
  error: string | null;
}

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const {
    produtor,
    propriedade,
    sensores,
    leituras,
    alertas,
    logout,
    getDashboardMetrics,
    getRecentAlerts,
    getSensorReadings,
    isOnline,
    syncData
  } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const [showDebug, setShowDebug] = useState(false); // ✅ NOVO: Estado para debug
  const [debugPressCount, setDebugPressCount] = useState(0); // ✅ NOVO: Contador para ativar debug
  
  const [dashboardData, setDashboardData] = useState({
    waterUsage: 0,
    savings: 0,
    efficiency: 0,
    alerts: 0,
    soilHealth: 'Carregando...',
    sensorsActive: 0,
    lastReading: null as string | null,
    isOffline: false,
  });

  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 0,
    description: '',
    humidity: 0,
    windSpeed: 0,
    pressure: 0,
    feelsLike: 0,
    rainProbability: 0,
    location: '',
    icon: 'partly-sunny',
    isLoading: true,
    error: null,
  });

  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    loadDashboardData();
    initializeWeather();
    
    // ✅ NOVO: Executar diagnóstico automático em desenvolvimento
    if (__DEV__) {
      setTimeout(() => {
        runDevelopmentDiagnostic();
      }, 2000);
    }
  }, []);

  // ✅ NOVO: Diagnóstico automático para desenvolvimento
  const runDevelopmentDiagnostic = async () => {
    try {
      console.log('🔧 Executando diagnóstico automático da API...');
      await ApiDebugHelper.checkCommonIssues();
    } catch (error) {
      console.log('⚠️ Erro no diagnóstico automático:', error);
    }
  };

  // ✅ NOVO: Ativar debug com múltiplos toques
  const handleDebugPress = () => {
    if (!__DEV__) return;
    
    const newCount = debugPressCount + 1;
    setDebugPressCount(newCount);
    
    if (newCount >= 5) {
      setShowDebug(true);
      setDebugPressCount(0);
      console.log('🔧 Debug mode ativado!');
    } else {
      console.log(`🔧 Debug: ${newCount}/5 toques`);
    }
  };

  const initializeWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        await getCurrentWeather();
      } else {
        await getWeatherByCoordinates(
          propriedade?.latitude || -23.5505199,
          propriedade?.longitude || -46.6333094
        );
      }
    } catch (error) {
      console.error('Error initializing weather:', error);
      setMockWeatherData();
    }
  };

  const setMockWeatherData = () => {
    const mockWeatherData = {
      temperature: 24,
      description: 'Parcialmente nublado',
      humidity: 68,
      windSpeed: 8,
      pressure: 1013,
      feelsLike: 26,
      rainProbability: 15,
      location: propriedade?.nomePropriedade || 'Propriedade Rural',
      icon: 'partly-sunny',
      isLoading: false,
      error: isOnline ? null : 'Dados offline',
    };
    setWeatherData(mockWeatherData);
  };

  const loadDashboardData = async () => {
    try {
      const metrics = await getDashboardMetrics();
      if (metrics) {
        setDashboardData(metrics);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setDashboardData({
        waterUsage: propriedade?.areaHectares ? Math.floor(propriedade.areaHectares * 45) : 2250,
        savings: propriedade?.areaHectares ? Math.floor(propriedade.areaHectares * 25) : 1250,
        efficiency: 85,
        alerts: alertas.length || 0,
        soilHealth: propriedade?.nivelDegradacao || 'Bom',
        sensorsActive: sensores.length || 3,
        lastReading: leituras.length > 0 ? leituras[0].timestampLeitura : null,
        isOffline: !isOnline,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadDashboardData(),
        getRecentAlerts(),
        getSensorReadings(),
        syncData(),
      ]);

      if (locationPermission && isOnline) {
        await getCurrentWeather();
      } else if (isOnline) {
        await getWeatherByCoordinates(
          propriedade?.latitude || -23.5505199,
          propriedade?.longitude || -46.6333094
        );
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getCurrentWeather = async () => {
    try {
      setWeatherData(prev => ({ ...prev, isLoading: true, error: null }));

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      await getWeatherByCoordinates(latitude, longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
      if (propriedade?.latitude && propriedade?.longitude) {
        await getWeatherByCoordinates(propriedade.latitude, propriedade.longitude);
      } else {
        setMockWeatherData();
      }
    }
  };

  const getWeatherByCoordinates = async (latitude: number, longitude: number) => {
    try {
      if (!isOnline) {
        setMockWeatherData();
        return;
      }

      const API_KEY = '15fdde76e737dbe2d971e8afc682ae3c';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt_br`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const iconMap: { [key: string]: string } = {
        '01d': 'sunny', '01n': 'moon', '02d': 'partly-sunny', '02n': 'cloudy-night',
        '03d': 'cloudy', '03n': 'cloudy', '04d': 'cloudy', '04n': 'cloudy',
        '09d': 'rainy', '09n': 'rainy', '10d': 'rainy', '10n': 'rainy',
        '11d': 'thunderstorm', '11n': 'thunderstorm', '13d': 'snow', '13n': 'snow',
        '50d': 'cloudy', '50n': 'cloudy',
      };

      let locationName = propriedade?.nomePropriedade || 'Localização atual';

      try {
        const geocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const geocodeResponse = await fetch(geocodeUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.length > 0) {
            locationName = `${geocodeData[0].name}, ${geocodeData[0].state || geocodeData[0].country}`;
          }
        }
      } catch (geocodeError) {
        console.log('Geocode failed, using fallback location name');
      }

      setWeatherData({
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        pressure: data.main.pressure,
        feelsLike: Math.round(data.main.feels_like),
        rainProbability: Math.round((data.clouds.all / 100) * 100),
        location: locationName,
        icon: iconMap[data.weather[0].icon] || 'partly-sunny',
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching weather data:', error);
      setMockWeatherData();
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          }
        },
      ]
    );
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleWeatherRefresh = async () => {
    if (!isOnline) {
      Alert.alert(
        'Modo Offline',
        'Você está offline. Os dados meteorológicos mostrados são simulados. Conecte-se à internet para obter dados atualizados.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (locationPermission) {
      await getCurrentWeather();
    } else {
      Alert.alert(
        'Permissão de Localização',
        'Para obter dados meteorológicos atualizados, permita o acesso à localização.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Configurações',
            onPress: () => initializeWeather()
          }
        ]
      );
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getDegradationLevel = () => {
    if (!propriedade?.nivelNumerico) {
      return { text: 'Não informado', color: '#888888' };
    }

    const nivel = propriedade.nivelNumerico;
    const levels = {
      1: { text: 'Excelente', color: '#4CAF50' },
      2: { text: 'Bom', color: '#8BC34A' },
      3: { text: 'Moderado', color: '#FF9800' },
      4: { text: 'Ruim', color: '#FF5722' },
      5: { text: 'Crítico', color: '#F44336' },
    };
    return levels[nivel as keyof typeof levels] || levels[1];
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 10) return '#2196F3';
    if (temp <= 20) return '#00BCD4';
    if (temp <= 25) return '#4CAF50';
    if (temp <= 30) return '#FF9800';
    return '#F44336';
  };

  const formatLastReading = (timestamp: string | null) => {
    if (!timestamp) return 'Nunca';

    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(minutes / 60);

      if (minutes < 60) {
        return `${minutes}min atrás`;
      } else if (hours < 24) {
        return `${hours}h atrás`;
      } else {
        return date.toLocaleDateString('pt-BR');
      }
    } catch (error) {
      return 'Erro na data';
    }
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
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerLeft}>
            <View style={styles.connectionStatus}>
              {/* ✅ NOVO: Toque múltiplo para ativar debug */}
              <TouchableOpacity 
                onPress={handleDebugPress}
                style={styles.greetingContainer}
              >
                <Text style={styles.greeting}>{getGreeting()},</Text>
              </TouchableOpacity>
              
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? '#4CAF50' : '#FF9800' }
                ]} />
                <Text style={styles.statusText}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
                {/* ✅ NOVO: Indicador de debug em desenvolvimento */}
                {__DEV__ && (
                  <Text style={styles.debugIndicator}> 🔧</Text>
                )}
              </View>
            </View>
            <Text style={styles.userName}>
              {produtor?.nomeCompleto?.split(' ')[0] || 'Usuário'}
            </Text>
            <Text style={styles.propertyName}>{propriedade?.nomePropriedade}</Text>
            <Text style={styles.propertyDetails}>
              {propriedade?.areaHectares?.toFixed(1)}ha • {degradationLevel.text}
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

        {/* Conteúdo Scrollável */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00FFCC"
              colors={['#00FFCC']}
              title={isOnline ? "Atualizando..." : "Dados offline"}
            />
          }
          bounces={true}
          scrollEventThrottle={16}
        >
          {/* Statistics Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo do Dia</Text>
            <View style={styles.statsContainer}>
              <StatCard
                icon="water-outline"
                title="Uso de Água"
                value={Number(dashboardData.waterUsage).toLocaleString('pt-BR')}
                unit="L"
                color="#2196F3"
              />
              <StatCard
                icon="leaf-outline"
                title="Economia"
                value={Number(dashboardData.savings).toLocaleString('pt-BR')}
                unit="L"
                color="#4CAF50"
              />
            </View>
            <View style={styles.statsContainer}>
              <StatCard
                icon="speedometer-outline"
                title="Eficiência"
                value={Number(dashboardData.efficiency)}
                unit="%"
                color="#00FFCC"
              />
              <StatCard
                icon="warning-outline"
                title="Alertas"
                value={Number(dashboardData.alerts)}
                unit="ativos"
                color={dashboardData.alerts > 0 ? "#FF9800" : "#4CAF50"}
              />
            </View>
          </View>

          {/* Weather Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Condições Climáticas</Text>
              {!weatherData.isLoading && (
                <TouchableOpacity onPress={handleWeatherRefresh} style={styles.refreshButton}>
                  <Ionicons name="refresh" size={16} color="#00FFCC" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.weatherCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.weatherCardGradient}
              >
                {weatherData.isLoading ? (
                  <View style={styles.weatherLoading}>
                    <ActivityIndicator size="large" color="#00FFCC" />
                    <Text style={styles.weatherLoadingText}>Carregando clima...</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.weatherMain}>
                      <Ionicons
                        name={weatherData.icon as any}
                        size={64}
                        color={getTemperatureColor(weatherData.temperature)}
                      />
                      <View style={styles.weatherInfo}>
                        <Text style={[
                          styles.temperature,
                          { color: getTemperatureColor(weatherData.temperature) }
                        ]}>
                          {weatherData.temperature}°C
                        </Text>
                        <Text style={styles.weatherDescription}>
                          {weatherData.description}
                        </Text>
                        <Text style={styles.weatherLocation}>
                          {weatherData.location}
                        </Text>
                        <Text style={styles.feelsLike}>
                          Sensação: {weatherData.feelsLike}°C
                        </Text>
                        {weatherData.error && (
                          <Text style={styles.weatherError}>
                            {weatherData.error}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.weatherDetails}>
                      <View style={styles.weatherDetailItem}>
                        <Ionicons name="water-outline" size={16} color="#2196F3" />
                        <Text style={styles.weatherDetailText}>
                          {weatherData.humidity}%
                        </Text>
                      </View>
                      <View style={styles.weatherDetailItem}>
                        <Ionicons name="speedometer-outline" size={16} color="#9E9E9E" />
                        <Text style={styles.weatherDetailText}>
                          {weatherData.pressure}hPa
                        </Text>
                      </View>
                      <View style={styles.weatherDetailItem}>
                        <Ionicons name="rainy-outline" size={16} color="#FF9800" />
                        <Text style={styles.weatherDetailText}>
                          {weatherData.rainProbability}%
                        </Text>
                      </View>
                      <View style={styles.weatherDetailItem}>
                        <Ionicons name="compass-outline" size={16} color="#4CAF50" />
                        <Text style={styles.weatherDetailText}>
                          {weatherData.windSpeed}km/h
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </LinearGradient>
            </View>
          </View>

          {/* Sensor Readings */}
          {leituras.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Última Leitura dos Sensores</Text>
              <View style={styles.sensorCard}>
                <LinearGradient
                  colors={['#2D2D2D', '#3D3D3D']}
                  style={styles.sensorCardGradient}
                >
                  <View style={styles.sensorHeader}>
                    <Text style={styles.sensorTitle}>Sensores IoT</Text>
                    <Text style={styles.sensorTime}>
                      {formatLastReading(leituras[0]?.timestampLeitura)}
                    </Text>
                  </View>
                  <View style={styles.sensorReadings}>
                    {leituras[0]?.umidadeSolo && (
                      <View style={styles.sensorReading}>
                        <Ionicons name="water-outline" size={20} color="#2196F3" />
                        <Text style={styles.sensorLabel}>Umidade do Solo</Text>
                        <Text style={styles.sensorValue}>
                          {leituras[0].umidadeSolo.toFixed(1)}%
                        </Text>
                      </View>
                    )}
                    {leituras[0]?.temperaturaAr && (
                      <View style={styles.sensorReading}>
                        <Ionicons name="thermometer-outline" size={20} color="#FF9800" />
                        <Text style={styles.sensorLabel}>Temperatura</Text>
                        <Text style={styles.sensorValue}>
                          {leituras[0].temperaturaAr.toFixed(1)}°C
                        </Text>
                      </View>
                    )}
                    {leituras[0]?.precipitacaoMm && (
                      <View style={styles.sensorReading}>
                        <Ionicons name="rainy-outline" size={20} color="#4CAF50" />
                        <Text style={styles.sensorLabel}>Precipitação</Text>
                        <Text style={styles.sensorValue}>
                          {leituras[0].precipitacaoMm.toFixed(1)}mm
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <QuickActionCard
              icon="analytics-outline"
              title="Ver Relatórios"
              color="#2196F3"
              onPress={() => navigation.navigate('Reports')}
            />
            <QuickActionCard
              icon="settings-outline"
              title="Configurar Sensores"
              color="#FF9800"
              onPress={() => navigation.navigate('Sensors')}
            />
            {/* ✅ NOVO: Botão de debug apenas em desenvolvimento */}
            {__DEV__ && (
              <QuickActionCard
                icon="bug-outline"
                title="Debug da API"
                color="#9C27B0"
                onPress={() => setShowDebug(true)}
              />
            )}
          </View>

          {/* Property Status */}
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
                      {propriedade?.latitude?.toFixed(4) || '0.0000'}°, {propriedade?.longitude?.toFixed(4) || '0.0000'}°
                    </Text>
                  </View>
                  <View style={styles.healthItem}>
                    <Ionicons name="leaf-outline" size={20} color={degradationLevel.color} />
                    <Text style={styles.healthLabel}>Saúde do Solo</Text>
                    <Text style={[styles.healthValue, { color: degradationLevel.color }]}>
                      {degradationLevel.text}
                    </Text>
                  </View>
                  <View style={styles.healthItem}>
                    <Ionicons name="hardware-chip-outline" size={20} color="#2196F3" />
                    <Text style={styles.healthLabel}>Sensores</Text>
                    <Text style={styles.healthValue}>
                      {dashboardData.sensorsActive} ativos
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Offline Notice */}
          {!isOnline && (
            <View style={styles.section}>
              <View style={styles.offlineNotice}>
                <LinearGradient
                  colors={['rgba(255, 152, 0, 0.1)', 'rgba(255, 152, 0, 0.2)']}
                  style={styles.offlineNoticeGradient}
                >
                  <Ionicons name="cloud-offline-outline" size={24} color="#FF9800" />
                  <View style={styles.offlineNoticeContent}>
                    <Text style={styles.offlineNoticeTitle}>Modo Offline</Text>
                    <Text style={styles.offlineNoticeText}>
                      Você está visualizando dados salvos localmente.
                      Conecte-se à internet para sincronizar.
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* ✅ NOVO: Componente de Debug */}
        <ApiDebugComponent 
          visible={showDebug} 
          onClose={() => setShowDebug(false)} 
        />
      </LinearGradient>
    </SafeAreaView>
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
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
    zIndex: 1,
  },
  headerLeft: {
    flex: 1,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  greetingContainer: {
    // ✅ NOVO: Container para o toque de debug
  },
  greeting: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '400',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
  debugIndicator: {
    color: '#FF9800',
    fontSize: 12,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.3)',
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
  weatherLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  weatherLoadingText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherInfo: {
    marginLeft: 16,
    flex: 1,
  },
  temperature: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  weatherDescription: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  weatherLocation: {
    color: '#00FFCC',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  feelsLike: {
    color: '#CCCCCC',
    fontSize: 11,
    fontWeight: '400',
  },
  weatherError: {
    color: '#FF9800',
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  weatherDetailText: {
    color: '#CCCCCC',
    fontSize: 11,
    fontWeight: '400',
    marginLeft: 4,
    textAlign: 'center',
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
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sensorTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sensorTime: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  sensorReadings: {
    gap: 12,
  },
  sensorReading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sensorLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  sensorValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    textAlign: 'center',
  },
  healthValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  offlineNotice: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  offlineNoticeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    borderRadius: 12,
  },
  offlineNoticeContent: {
    marginLeft: 12,
    flex: 1,
  },
  offlineNoticeTitle: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  offlineNoticeText: {
    color: '#CCCCCC',
    fontSize: 12,
    lineHeight: 16,
  },
  bottomPadding: {
    height: 40,
  },
});

export default DashboardScreen;
