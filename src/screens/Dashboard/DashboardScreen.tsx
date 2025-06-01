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
  const { produtor, propriedade, sensores, leituras, alertas, logout, getDashboardMetrics, getRecentAlerts, getSensorReadings } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const [dashboardData, setDashboardData] = useState({
    waterUsage: 0,
    savings: 0,
    efficiency: 0,
    alerts: 0,
    soilHealth: 'Carregando...',
    sensorsActive: 0,
    lastReading: null,
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
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        await getCurrentWeather();
      } else {
        setWeatherData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Permissão de localização negada',
        }));
        // Usar localização da propriedade como fallback
        await getWeatherByCoordinates(
          propriedade?.latitude || -23.5505199,
          propriedade?.longitude || -46.6333094
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setWeatherData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao solicitar permissão',
      }));
    }
  };

  const getCurrentWeather = async () => {
    try {
      setWeatherData(prev => ({ ...prev, isLoading: true, error: null }));

      // Obter localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      await getWeatherByCoordinates(latitude, longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
      // Fallback para localização da propriedade
      if (propriedade?.latitude && propriedade?.longitude) {
        await getWeatherByCoordinates(propriedade.latitude, propriedade.longitude);
      } else {
        setWeatherData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Não foi possível obter localização',
        }));
      }
    }
  };

  const getWeatherByCoordinates = async (latitude: number, longitude: number) => {
    try {
      // OpenWeatherMap API - WaterWise Key
      const API_KEY = '15fdde76e737dbe2d971e8afc682ae3c';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt_br`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Mapear ícones do OpenWeatherMap para ícones do Ionicons
      const iconMap: { [key: string]: string } = {
        '01d': 'sunny',           // céu limpo (dia)
        '01n': 'moon',            // céu limpo (noite)
        '02d': 'partly-sunny',    // poucas nuvens (dia)
        '02n': 'cloudy-night',    // poucas nuvens (noite)
        '03d': 'cloudy',          // nuvens dispersas
        '03n': 'cloudy',          // nuvens dispersas
        '04d': 'cloudy',          // nublado
        '04n': 'cloudy',          // nublado
        '09d': 'rainy',           // chuva
        '09n': 'rainy',           // chuva
        '10d': 'rainy',           // chuva (dia)
        '10n': 'rainy',           // chuva (noite)
        '11d': 'thunderstorm',    // tempestade
        '11n': 'thunderstorm',    // tempestade
        '13d': 'snow',            // neve
        '13n': 'snow',            // neve
        '50d': 'cloudy',          // névoa
        '50n': 'cloudy',          // névoa
      };

      // Obter nome da cidade
      const geocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      const geocodeResponse = await fetch(geocodeUrl);
      let locationName = 'Localização atual';
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.length > 0) {
          locationName = `${geocodeData[0].name}, ${geocodeData[0].state || geocodeData[0].country}`;
        }
      }

      setWeatherData({
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // converter m/s para km/h
        pressure: data.main.pressure,
        feelsLike: Math.round(data.main.feels_like),
        rainProbability: Math.round((data.clouds.all / 100) * 100), // usar cobertura de nuvens como proxy
        location: locationName,
        icon: iconMap[data.weather[0].icon] || 'partly-sunny',
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      // Dados mock como fallback
      const mockWeatherData = {
        temperature: 24,
        description: 'Parcialmente nublado',
        humidity: 68,
        windSpeed: 8,
        pressure: 1013,
        feelsLike: 26,
        rainProbability: 15,
        location: propriedade?.latitude && propriedade.latitude < -23 ? 'São Paulo, SP' : 'Região Metropolitana, SP',
        icon: 'partly-sunny',
        isLoading: false,
        error: 'Usando dados simulados',
      };

      setWeatherData(mockWeatherData);
    }
  };

  const loadDashboardData = async () => {
    try {
      const metrics = await getDashboardMetrics();
      if (metrics) {
        setDashboardData(metrics);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDashboardData(),
      getRecentAlerts(),
      getSensorReadings(),
      locationPermission ? getCurrentWeather() : getWeatherByCoordinates(
        propriedade?.latitude || -23.5505199,
        propriedade?.longitude || -46.6333094
      )
    ]);
    setRefreshing(false);
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
            onPress: () => requestLocationPermission()
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
    if (!propriedade?.nivel_degradacao) {
      return { text: 'Não informado', color: '#888888' };
    }

    const nivel = propriedade.nivel_degradacao.nivel_numerico;
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
    if (temp <= 10) return '#2196F3'; // Azul - muito frio
    if (temp <= 20) return '#00BCD4'; // Ciano - frio
    if (temp <= 25) return '#4CAF50'; // Verde - agradável
    if (temp <= 30) return '#FF9800'; // Laranja - quente
    return '#F44336'; // Vermelho - muito quente
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
        {/* Header - Fixo */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>
              {produtor?.nome_completo?.split(' ')[0] || 'Usuário'}
            </Text>
            <Text style={styles.propertyName}>{propriedade?.nome_propriedade}</Text>
            <Text style={styles.propertyDetails}>
              {propriedade?.area_hectares?.toFixed(1)}ha • {propriedade?.nivel_degradacao?.codigo_degradacao || 'N/A'}
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
            />
          }
          bounces={true}
          scrollEventThrottle={16}
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
                  <View style={styles.healthItem}>
                    <Ionicons name="hardware-chip-outline" size={20} color="#2196F3" />
                    <Text style={styles.healthLabel}>Sensores Ativos</Text>
                    <Text style={styles.healthValue}>
                      {dashboardData.sensorsActive}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Espaço extra no final */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default DashboardScreen;


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
  weatherError: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  weatherErrorText: {
    color: '#FF5722',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#00FFCC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
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
  alertsContainer: {
    gap: 12,
  },
  alertCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  alertCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  alertTime: {
    color: '#CCCCCC',
    fontSize: 12,
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
  bottomPadding: {
    height: 40,
  },
});