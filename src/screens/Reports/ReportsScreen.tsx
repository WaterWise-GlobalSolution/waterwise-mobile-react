import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReportsScreenProps {
  navigation: any;
}

interface ReportData {
  id: string;
  title: string;
  description: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  color: string;
  icon: string;
}

const { width } = Dimensions.get('window');

const ReportsScreen: React.FC<ReportsScreenProps> = ({ navigation }) => {
  const { 
    produtor, 
    propriedade, 
    sensores, 
    leituras, 
    alertas, 
    isOnline 
  } = useAuth();
  
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [reportsData, setReportsData] = useState<ReportData[]>([]);

  useEffect(() => {
    generateReportsData();
  }, [selectedPeriod, leituras, propriedade]);

  const generateReportsData = () => {
    if (!propriedade) return;

    // Gerar dados de relatório baseados nos dados offline
    const area = propriedade.area_hectares;
    const degradationLevel = propriedade.nivel_degradacao?.nivel_numerico || 1;
    
    // Calcular métricas baseadas no período selecionado
    const periodMultiplier = {
      'day': 1,
      'week': 7,
      'month': 30,
      'year': 365
    }[selectedPeriod] || 7;

    const baseWaterUsage = area * 45 * periodMultiplier;
    const degradationMultiplier = 1 + (degradationLevel - 1) * 0.2;
    const waterUsage = Math.floor(baseWaterUsage * degradationMultiplier);
    
    const savings = Math.floor(area * 25 * (6 - degradationLevel) / 5 * periodMultiplier);
    const efficiency = Math.max(60, 95 - (degradationLevel - 1) * 8);
    
    // Simular dados históricos com variação
    const previousWaterUsage = waterUsage * (0.9 + Math.random() * 0.2);
    const previousSavings = savings * (0.85 + Math.random() * 0.3);
    const previousEfficiency = efficiency * (0.9 + Math.random() * 0.2);

    const reports: ReportData[] = [
      {
        id: 'water-usage',
        title: 'Consumo de Água',
        description: `Consumo total no período selecionado`,
        value: waterUsage.toLocaleString('pt-BR'),
        unit: 'L',
        trend: waterUsage < previousWaterUsage ? 'down' : 'up',
        percentage: Math.abs(((waterUsage - previousWaterUsage) / previousWaterUsage) * 100),
        color: '#2196F3',
        icon: 'water-outline'
      },
      {
        id: 'water-savings',
        title: 'Economia de Água',
        description: 'Economia comparada ao período anterior',
        value: savings.toLocaleString('pt-BR'),
        unit: 'L',
        trend: savings > previousSavings ? 'up' : 'down',
        percentage: Math.abs(((savings - previousSavings) / previousSavings) * 100),
        color: '#4CAF50',
        icon: 'leaf-outline'
      },
      {
        id: 'efficiency',
        title: 'Eficiência Hídrica',
        description: 'Eficiência média de uso da água',
        value: efficiency.toFixed(1),
        unit: '%',
        trend: efficiency > previousEfficiency ? 'up' : 'down',
        percentage: Math.abs(((efficiency - previousEfficiency) / previousEfficiency) * 100),
        color: '#00FFCC',
        icon: 'speedometer-outline'
      },
      {
        id: 'alerts',
        title: 'Alertas Gerados',
        description: 'Total de alertas no período',
        value: Math.floor(alertas.length * periodMultiplier / 7).toString(),
        unit: 'alertas',
        trend: 'stable',
        percentage: 0,
        color: alertas.length > 0 ? '#FF9800' : '#4CAF50',
        icon: 'warning-outline'
      }
    ];

    setReportsData(reports);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleExportReport = () => {
    if (!isOnline) {
      Alert.alert(
        'Modo Offline', 
        'Exportação de relatórios não está disponível offline. Conecte-se à internet para exportar relatórios.'
      );
      return;
    }
    
    Alert.alert(
      'Exportar Relatório',
      'Escolha o formato de exportação:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'PDF', onPress: () => exportToPDF() },
        { text: 'Excel', onPress: () => exportToExcel() },
      ]
    );
  };

  const exportToPDF = () => {
    Alert.alert('Em Desenvolvimento', 'Exportação para PDF estará disponível em breve.');
  };

  const exportToExcel = () => {
    Alert.alert('Em Desenvolvimento', 'Exportação para Excel estará disponível em breve.');
  };

  const PeriodButton = ({ period, label, isActive, onPress }: any) => (
    <TouchableOpacity
      style={[styles.periodButton, isActive && styles.activePeriodButton]}
      onPress={onPress}
    >
      <Text style={[styles.periodButtonText, isActive && styles.activePeriodButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ReportCard = ({ report }: { report: ReportData }) => (
    <View style={styles.reportCard}>
      <LinearGradient
        colors={['#2D2D2D', '#3D3D3D']}
        style={styles.reportCardGradient}
      >
        <View style={styles.reportCardHeader}>
          <View style={[styles.reportIconContainer, { backgroundColor: report.color + '20' }]}>
            <Ionicons name={report.icon as any} size={24} color={report.color} />
          </View>
          <View style={styles.reportTrendContainer}>
            {report.trend !== 'stable' && (
              <>
                <Ionicons 
                  name={report.trend === 'up' ? 'arrow-up' : 'arrow-down'} 
                  size={16} 
                  color={report.trend === 'up' ? '#4CAF50' : '#F44336'} 
                />
                <Text style={[
                  styles.reportTrendText,
                  { color: report.trend === 'up' ? '#4CAF50' : '#F44336' }
                ]}>
                  {report.percentage.toFixed(1)}%
                </Text>
              </>
            )}
          </View>
        </View>
        
        <View style={styles.reportCardContent}>
          <Text style={styles.reportValue}>
            {report.value}
            <Text style={styles.reportUnit}> {report.unit}</Text>
          </Text>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportDescription}>{report.description}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const SensorReadingCard = () => {
    if (leituras.length === 0) return null;

    const latestReading = leituras[0];
    
    return (
      <View style={styles.sensorCard}>
        <LinearGradient
          colors={['#2D2D2D', '#3D3D3D']}
          style={styles.sensorCardGradient}
        >
          <View style={styles.sensorCardHeader}>
            <Text style={styles.sensorCardTitle}>Últimas Leituras dos Sensores</Text>
            <Text style={styles.sensorCardTime}>
              {new Date(latestReading.timestamp_leitura).toLocaleString('pt-BR')}
            </Text>
          </View>
          
          <View style={styles.sensorReadings}>
            {latestReading.umidade_solo && (
              <View style={styles.sensorReading}>
                <Ionicons name="water-outline" size={20} color="#2196F3" />
                <View style={styles.sensorReadingContent}>
                  <Text style={styles.sensorReadingLabel}>Umidade do Solo</Text>
                  <Text style={styles.sensorReadingValue}>
                    {latestReading.umidade_solo.toFixed(1)}%
                  </Text>
                </View>
              </View>
            )}
            
            {latestReading.temperatura_ar && (
              <View style={styles.sensorReading}>
                <Ionicons name="thermometer-outline" size={20} color="#FF9800" />
                <View style={styles.sensorReadingContent}>
                  <Text style={styles.sensorReadingLabel}>Temperatura</Text>
                  <Text style={styles.sensorReadingValue}>
                    {latestReading.temperatura_ar.toFixed(1)}°C
                  </Text>
                </View>
              </View>
            )}
            
            {latestReading.precipitacao_mm !== undefined && latestReading.precipitacao_mm > 0 && (
              <View style={styles.sensorReading}>
                <Ionicons name="rainy-outline" size={20} color="#4CAF50" />
                <View style={styles.sensorReadingContent}>
                  <Text style={styles.sensorReadingLabel}>Precipitação</Text>
                  <Text style={styles.sensorReadingValue}>
                    {latestReading.precipitacao_mm.toFixed(1)}mm
                  </Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Relatórios</Text>
          <TouchableOpacity onPress={handleExportReport} style={styles.exportButton}>
            <Ionicons name="download-outline" size={24} color="#00FFCC" />
          </TouchableOpacity>
        </View>

        {/* Status Connection */}
        {!isOnline && (
          <View style={styles.offlineNotice}>
            <Ionicons name="cloud-offline-outline" size={16} color="#FF9800" />
            <Text style={styles.offlineNoticeText}>
              Dados offline • Conecte-se para sincronizar
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
                {propriedade?.area_hectares?.toFixed(1)}ha • {produtor?.nome_completo}
              </Text>
            </View>
          </View>

          {/* Period Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Período</Text>
            <View style={styles.periodContainer}>
              <PeriodButton
                period="day"
                label="Hoje"
                isActive={selectedPeriod === 'day'}
                onPress={() => setSelectedPeriod('day')}
              />
              <PeriodButton
                period="week"
                label="7 dias"
                isActive={selectedPeriod === 'week'}
                onPress={() => setSelectedPeriod('week')}
              />
              <PeriodButton
                period="month"
                label="30 dias"
                isActive={selectedPeriod === 'month'}
                onPress={() => setSelectedPeriod('month')}
              />
              <PeriodButton
                period="year"
                label="1 ano"
                isActive={selectedPeriod === 'year'}
                onPress={() => setSelectedPeriod('year')}
              />
            </View>
          </View>

          {/* Reports Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métricas</Text>
            <View style={styles.reportsGrid}>
              {reportsData.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </View>
          </View>

          {/* Sensor Readings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monitoramento IoT</Text>
            <SensorReadingCard />
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendações</Text>
            <View style={styles.recommendationCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.recommendationCardGradient}
              >
                <View style={styles.recommendationHeader}>
                  <Ionicons name="bulb-outline" size={24} color="#FFD700" />
                  <Text style={styles.recommendationTitle}>Dicas de Otimização</Text>
                </View>
                
                <View style={styles.recommendationList}>
                  {propriedade?.nivel_degradacao && propriedade.nivel_degradacao.nivel_numerico > 2 && (
                    <View style={styles.recommendationItem}>
                      <Ionicons name="leaf-outline" size={16} color="#4CAF50" />
                      <Text style={styles.recommendationText}>
                        {propriedade.nivel_degradacao.acoes_corretivas}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.recommendationItem}>
                    <Ionicons name="water-outline" size={16} color="#2196F3" />
                    <Text style={styles.recommendationText}>
                      Considere instalar sistema de gotejamento para reduzir consumo
                    </Text>
                  </View>
                  
                  <View style={styles.recommendationItem}>
                    <Ionicons name="analytics-outline" size={16} color="#00FFCC" />
                    <Text style={styles.recommendationText}>
                      Monitore a umidade do solo regularmente para otimizar irrigação
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.bottomPadding} />
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
  exportButton: {
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
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2D2D2D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderColor: '#00FFCC',
  },
  periodButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  activePeriodButtonText: {
    color: '#00FFCC',
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportCard: {
    width: (width - 52) / 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  reportCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  reportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTrendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportTrendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  reportCardContent: {
    alignItems: 'flex-start',
  },
  reportValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  reportUnit: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '400',
  },
  reportTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportDescription: {
    color: '#CCCCCC',
    fontSize: 12,
    lineHeight: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sensorCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sensorCardTime: {
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
  sensorReadingContent: {
    marginLeft: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sensorReadingLabel: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  sensorReadingValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  recommendationCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  recommendationList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

export default ReportsScreen;