import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

type RegisterAddressScreenProps = {
  navigation: any;
  route: {
    params?: {
      produtorData?: any;
    };
  };
};

const RegisterAddressScreen: React.FC<RegisterAddressScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const insets = useSafeAreaInsets();
  const { register, isOnline } = useAuth();
  
  const produtorData = route.params?.produtorData;
  
  const [isLoading, setIsLoading] = useState(false);
  const [niveisDegrade, setNiveisDegrade] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nomePropriedade: '',
    latitude: '',
    longitude: '',
    areaHectares: '',
    tipoSolo: '',
    nivelDegradacao: '1',
  });

  // Carregar níveis de degradação da API ou usar dados mock
  useEffect(() => {
    loadNiveisDegrade();
  }, []);

  const loadNiveisDegrade = async () => {
    try {
      if (isOnline) {
        // TODO: Implementar endpoint para buscar níveis de degradação
        // const response = await api.get('/niveisDegradacao');
        // setNiveisDegrade(response.data.items || response.data);
      }
      
      // Fallback para dados mock baseados na estrutura da API
      const mockNiveis = [
        { id: 1, nome: 'Excelente', desc: 'Solo em excelente estado', codigoDegradacao: 'EXCELENTE' },
        { id: 2, nome: 'Bom', desc: 'Solo com sinais mínimos de degradação', codigoDegradacao: 'BOM' },
        { id: 3, nome: 'Moderado', desc: 'Solo necessita atenção', codigoDegradacao: 'MODERADO' },
        { id: 4, nome: 'Ruim', desc: 'Solo degradado', codigoDegradacao: 'RUIM' },
        { id: 5, nome: 'Crítico', desc: 'Solo criticamente degradado', codigoDegradacao: 'CRITICO' },
      ];
      setNiveisDegrade(mockNiveis);
    } catch (error) {
      console.error('Erro ao carregar níveis de degradação:', error);
    }
  };

  // Opções de tipo de solo comuns no Brasil
  const tiposSolo = [
    'Latossolo',
    'Argissolo',
    'Neossolo',
    'Cambissolo',
    'Gleissolo',
    'Espodossolo',
    'Plintossolo',
    'Nitossolo',
    'Organossolo',
    'Outro'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatArea = (value: string) => {
    // Permite apenas números e vírgula/ponto para decimais
    const cleaned = value.replace(/[^0-9.,]/g, '');
    // Replace vírgula por ponto para padronização
    return cleaned.replace(',', '.');
  };

  const formatCoordinate = (value: string) => {
    // Permite números, vírgula, ponto e sinal negativo
    const cleaned = value.replace(/[^0-9.,-]/g, '');
    return cleaned.replace(',', '.');
  };

  const validateCoordinate = (coord: string, type: 'lat' | 'lng') => {
    const num = parseFloat(coord);
    if (isNaN(num)) return false;
    
    if (type === 'lat') {
      // Latitude válida: -90 a +90
      return num >= -90 && num <= 90;
    } else {
      // Longitude válida: -180 a +180
      return num >= -180 && num <= 180;
    }
  };

  const validateForm = () => {
    const { nomePropriedade, latitude, longitude, areaHectares, tipoSolo } = formData;

    if (!nomePropriedade.trim()) {
      Alert.alert('Erro de Validação', 'Nome da propriedade é obrigatório');
      return false;
    }

    if (nomePropriedade.trim().length < 3) {
      Alert.alert('Erro de Validação', 'Nome da propriedade deve ter pelo menos 3 caracteres');
      return false;
    }

    if (!latitude.trim()) {
      Alert.alert('Erro de Validação', 'Latitude é obrigatória');
      return false;
    }

    if (!validateCoordinate(latitude, 'lat')) {
      Alert.alert('Erro de Validação', 'Latitude inválida (deve estar entre -90 e +90)');
      return false;
    }

    if (!longitude.trim()) {
      Alert.alert('Erro de Validação', 'Longitude é obrigatória');
      return false;
    }

    if (!validateCoordinate(longitude, 'lng')) {
      Alert.alert('Erro de Validação', 'Longitude inválida (deve estar entre -180 e +180)');
      return false;
    }

    if (!areaHectares.trim()) {
      Alert.alert('Erro de Validação', 'Área em hectares é obrigatória');
      return false;
    }

    const area = parseFloat(areaHectares);
    if (isNaN(area) || area <= 0) {
      Alert.alert('Erro de Validação', 'Área deve ser um número maior que zero');
      return false;
    }

    if (area > 999999) {
      Alert.alert('Erro de Validação', 'Área não pode exceder 999.999 hectares');
      return false;
    }

    if (!tipoSolo.trim()) {
      Alert.alert('Erro de Validação', 'Tipo de solo é obrigatório');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    if (!produtorData) {
      Alert.alert('Erro', 'Dados do produtor não encontrados. Volte e preencha novamente.');
      return;
    }

    setIsLoading(true);

    try {
      // Dados da propriedade rural seguindo a estrutura da API
      const propriedadeData = {
        nome_propriedade: formData.nomePropriedade.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        area_hectares: parseFloat(formData.areaHectares),
        tipo_solo: formData.tipoSolo,
        id_nivel_degradacao: parseInt(formData.nivelDegradacao),
      };

      // Chamada para o contexto de autenticação
      const success = await register(produtorData, propriedadeData);

      if (success) {
        Alert.alert(
          'Sucesso!',
          isOnline 
            ? 'Conta criada com sucesso! Bem-vindo ao WaterWise!'
            : 'Conta criada localmente! Será sincronizada quando você se conectar à internet. Bem-vindo ao WaterWise!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Erro', 
          isOnline
            ? 'Falha ao criar conta. Verifique os dados e tente novamente.'
            : 'Falha ao criar conta offline. Verifique os dados e tente novamente.'
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Erro', 
        isOnline
          ? 'Falha na conexão com o servidor. Verifique sua internet e tente novamente.'
          : 'Erro ao criar conta offline. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getLocationFromGPS = () => {
    Alert.alert(
      'Obter Localização',
      'Esta funcionalidade estará disponível em breve. Por enquanto, insira as coordenadas manualmente.\n\nDica: Use o Google Maps para encontrar as coordenadas da sua propriedade.',
      [{ text: 'OK' }]
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
          <Text style={styles.headerTitle}>Criar Conta</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: isOnline ? '#4CAF50' : '#FF9800' }
            ]} />
            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Passo 2 de 2</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <Text style={styles.title}>Propriedade Rural</Text>
              <Text style={styles.subtitle}>Cadastre os dados da sua propriedade</Text>

              {/* Nome da Propriedade */}
              <View style={styles.inputContainer}>
                <Ionicons name="home-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome da propriedade *"
                  placeholderTextColor="#888888"
                  value={formData.nomePropriedade}
                  onChangeText={(value) => handleInputChange('nomePropriedade', value)}
                  autoCapitalize="words"
                  maxLength={100}
                />
              </View>

              {/* Localização Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Localização</Text>
                <TouchableOpacity onPress={getLocationFromGPS} style={styles.gpsButton}>
                  <Ionicons name="location-outline" size={16} color="#00FFCC" />
                  <Text style={styles.gpsButtonText}>GPS</Text>
                </TouchableOpacity>
              </View>

              {/* Latitude */}
              <View style={styles.inputContainer}>
                <Ionicons name="navigate-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Latitude (ex: -23.5505) *"
                  placeholderTextColor="#888888"
                  value={formData.latitude}
                  onChangeText={(value) => handleInputChange('latitude', formatCoordinate(value))}
                  keyboardType="numeric"
                />
              </View>

              {/* Longitude */}
              <View style={styles.inputContainer}>
                <Ionicons name="compass-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Longitude (ex: -46.6333) *"
                  placeholderTextColor="#888888"
                  value={formData.longitude}
                  onChangeText={(value) => handleInputChange('longitude', formatCoordinate(value))}
                  keyboardType="numeric"
                />
              </View>

              {/* Área em Hectares */}
              <View style={styles.inputContainer}>
                <Ionicons name="resize-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Área (hectares) *"
                  placeholderTextColor="#888888"
                  value={formData.areaHectares}
                  onChangeText={(value) => handleInputChange('areaHectares', formatArea(value))}
                  keyboardType="numeric"
                />
              </View>

              {/* Tipo de Solo */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Características do Solo</Text>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="layers-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Tipo de solo *"
                  placeholderTextColor="#888888"
                  value={formData.tipoSolo}
                  onChangeText={(value) => handleInputChange('tipoSolo', value)}
                  maxLength={50}
                />
              </View>

              {/* Sugestões de Tipos de Solo */}
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionTitle}>Tipos comuns:</Text>
                <View style={styles.suggestionGrid}>
                  {tiposSolo.slice(0, 6).map((tipo) => (
                    <TouchableOpacity
                      key={tipo}
                      style={[
                        styles.suggestionChip,
                        formData.tipoSolo === tipo && styles.suggestionChipActive
                      ]}
                      onPress={() => handleInputChange('tipoSolo', tipo)}
                    >
                      <Text style={[
                        styles.suggestionChipText,
                        formData.tipoSolo === tipo && styles.suggestionChipTextActive
                      ]}>
                        {tipo}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Nível de Degradação */}
              <View style={styles.inputContainer}>
                <Ionicons name="analytics-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <View style={styles.selectContainer}>
                  <Text style={styles.selectLabel}>Nível de degradação do solo:</Text>
                  <View style={styles.degradationGrid}>
                    {niveisDegrade.map((nivel) => (
                      <TouchableOpacity
                        key={nivel.id}
                        style={[
                          styles.degradationOption,
                          formData.nivelDegradacao === String(nivel.id) && styles.degradationOptionActive
                        ]}
                        onPress={() => handleInputChange('nivelDegradacao', String(nivel.id))}
                      >
                        <Text style={[
                          styles.degradationOptionText,
                          formData.nivelDegradacao === String(nivel.id) && styles.degradationOptionTextActive
                        ]}>
                          {nivel.nome}
                        </Text>
                        <Text style={[
                          styles.degradationOptionDesc,
                          formData.nivelDegradacao === String(nivel.id) && styles.degradationOptionDescActive
                        ]}>
                          {nivel.desc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Offline Notice */}
              {!isOnline && (
                <View style={styles.offlineNotice}>
                  <Ionicons name="information-circle-outline" size={16} color="#FF9800" />
                  <Text style={styles.offlineNoticeText}>
                    Modo offline: sua propriedade será cadastrada localmente e sincronizada quando você se conectar à internet.
                  </Text>
                </View>
              )}

              {/* Info sobre coordenadas */}
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={16} color="#00FFCC" />
                <Text style={styles.infoText}>
                  💡 Dica: Use o Google Maps para encontrar as coordenadas da sua propriedade. 
                  Clique com o botão direito no local desejado e copie os valores de latitude e longitude.
                </Text>
              </View>

              {/* Info sobre área */}
              <View style={styles.infoContainer}>
                <Ionicons name="leaf-outline" size={16} color="#4CAF50" />
                <Text style={styles.infoText}>
                  🌱 O WaterWise otimiza o uso da água baseado na área e características do solo da sua propriedade.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Register Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleRegister}
              style={styles.registerButton}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#00FFCC', '#00D4AA']}
                style={styles.registerButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#1A1A1A" size="small" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Criar Conta</Text>
                    <Ionicons name="checkmark" size={20} color="#1A1A1A" style={styles.registerButtonIcon} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
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
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3D3D3D',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FFCC',
    borderRadius: 2,
  },
  progressText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.3)',
  },
  gpsButtonText: {
    color: '#00FFCC',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
  },
  selectContainer: {
    flex: 1,
  },
  selectLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  suggestionContainer: {
    marginBottom: 16,
  },
  suggestionTitle: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 8,
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#3D3D3D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4D4D4D',
  },
  suggestionChipActive: {
    backgroundColor: 'rgba(0, 255, 204, 0.2)',
    borderColor: '#00FFCC',
  },
  suggestionChipText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
  suggestionChipTextActive: {
    color: '#00FFCC',
  },
  degradationGrid: {
    gap: 8,
  },
  degradationOption: {
    backgroundColor: '#3D3D3D',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4D4D4D',
  },
  degradationOptionActive: {
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderColor: '#00FFCC',
  },
  degradationOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  degradationOptionTextActive: {
    color: '#00FFCC',
  },
  degradationOptionDesc: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  degradationOptionDescActive: {
    color: '#CCCCCC',
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  offlineNoticeText: {
    color: '#FF9800',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 255, 204, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.2)',
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  registerButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButtonIcon: {
    marginLeft: 8,
  },
});

export default RegisterAddressScreen;