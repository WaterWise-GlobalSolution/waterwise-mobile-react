import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { produtor, propriedade, logout, updateProdutor } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoSync: true,
    biometric: false,
    waterAlerts: true,
    maintenanceReminders: true,
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permissão necessária', 'É necessário permitir acesso à galeria para alterar a foto de perfil.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        // Aqui você faria upload da imagem para o servidor
        // e atualizaria o perfil do produtor
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao selecionar imagem');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permissão necessária', 'É necessário permitir acesso à câmera para tirar uma foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        // Aqui você faria upload da imagem para o servidor
        // e atualizaria o perfil do produtor
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao capturar imagem');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Alterar foto de perfil',
      'Escolha uma opção',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: handleImagePicker },
        { text: 'Câmera', onPress: handleCameraCapture },
      ]
    );
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLogout = () => {
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

  const formatCpfCnpj = (value: string) => {
    if (!value) return '';
    
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 11) {
      // Formato CPF
      return cleanValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    } else {
      // Formato CNPJ
      return cleanValue
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2');
    }
  };

  const formatPhone = (value: string) => {
    if (!value) return '';
    
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 10) {
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  };

  const getDegradationLevel = () => {
    if (!propriedade?.nivel_degradacao) {
      return { text: 'Não informado', color: '#888888', icon: 'help-circle' };
    }

    const nivel = propriedade.nivel_degradacao.nivel_numerico;
    const levels = {
      1: { text: 'Excelente', color: '#4CAF50', icon: 'checkmark-circle' },
      2: { text: 'Bom', color: '#8BC34A', icon: 'checkmark-circle-outline' },
      3: { text: 'Moderado', color: '#FF9800', icon: 'warning-outline' },
      4: { text: 'Ruim', color: '#FF5722', icon: 'alert-circle-outline' },
      5: { text: 'Crítico', color: '#F44336', icon: 'close-circle' },
    };
    return levels[nivel as keyof typeof levels] || levels[1];
  };

  const SettingItem = ({ icon, title, subtitle, type, value, onPress, onToggle }: any) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <Ionicons name={icon} size={20} color="#00FFCC" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {type === 'switch' ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#3D3D3D', true: '#00FFCC' }}
            thumbColor="#FFFFFF"
          />
        ) : (
          <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
        )}
      </View>
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
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurações</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <View style={styles.section}>
            <View style={styles.profileCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.profileCardGradient}
              >
                <TouchableOpacity onPress={showImagePicker} style={styles.profileImageContainer}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Ionicons name="person" size={40} color="#CCCCCC" />
                    </View>
                  )}
                  <View style={styles.profileImageOverlay}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{produtor?.nome_completo}</Text>
                  <Text style={styles.profileEmail}>{produtor?.email}</Text>
                  <Text style={styles.profileCpfCnpj}>
                    {formatCpfCnpj(produtor?.cpf_cnpj || '')}
                  </Text>
                  {produtor?.telefone && (
                    <Text style={styles.profilePhone}>
                      {formatPhone(produtor.telefone)}
                    </Text>
                  )}
                  <Text style={styles.profileProperty}>{propriedade?.nome_propriedade}</Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Property Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status da Propriedade</Text>
            <View style={styles.statusCard}>
              <LinearGradient
                colors={['#2D2D2D', '#3D3D3D']}
                style={styles.statusCardGradient}
              >
                <View style={styles.statusRow}>
                  <View style={styles.statusItem}>
                    <Ionicons name="resize-outline" size={20} color="#00FFCC" />
                    <Text style={styles.statusLabel}>Área</Text>
                    <Text style={styles.statusValue}>{propriedade?.area_hectares?.toFixed(1)} ha</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Ionicons name="layers-outline" size={20} color="#2196F3" />
                    <Text style={styles.statusLabel}>Solo</Text>
                    <Text style={styles.statusValue}>{propriedade?.nivel_degradacao?.codigo_degradacao || 'N/A'}</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Ionicons name={degradationLevel.icon as any} size={20} color={degradationLevel.color} />
                    <Text style={styles.statusLabel}>Saúde</Text>
                    <Text style={[styles.statusValue, { color: degradationLevel.color }]}>
                      {degradationLevel.text}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="person-outline"
                title="Editar Perfil"
                subtitle="Nome, email, telefone"
                type="navigate"
                onPress={() => Alert.alert('Em Desenvolvimento', 'Esta funcionalidade estará disponível em breve.')}
              />
              <SettingItem
                icon="home-outline"
                title="Propriedade"
                subtitle="Dados da propriedade rural"
                type="navigate"
                onPress={() => Alert.alert('Em Desenvolvimento', 'Esta funcionalidade estará disponível em breve.')}
              />
              <SettingItem
                icon="shield-outline"
                title="Segurança"
                subtitle="Senha, autenticação"
                type="navigate"
                onPress={() => Alert.alert('Em Desenvolvimento', 'Esta funcionalidade estará disponível em breve.')}
              />
            </View>
          </View>

          {/* App Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aplicativo</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="notifications-outline"
                title="Notificações"
                subtitle="Receber notificações push"
                type="switch"
                value={settings.notifications}
                onToggle={(value: boolean) => handleSettingChange('notifications', value)}
              />
              <SettingItem
                icon="sync-outline"
                title="Sincronização Automática"
                subtitle="Sincronizar dados automaticamente"
                type="switch"
                value={settings.autoSync}
                onToggle={(value: boolean) => handleSettingChange('autoSync', value)}
              />
              <SettingItem
                icon="finger-print-outline"
                title="Autenticação Biométrica"
                subtitle="Login com impressão digital"
                type="switch"
                value={settings.biometric}
                onToggle={(value: boolean) => handleSettingChange('biometric', value)}
              />
            </View>
          </View>

          {/* Water Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestão de Água</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="water-outline"
                title="Alertas de Consumo"
                subtitle="Notificar sobre uso excessivo"
                type="switch"
                value={settings.waterAlerts}
                onToggle={(value: boolean) => handleSettingChange('waterAlerts', value)}
              />
              <SettingItem
                icon="build-outline"
                title="Lembretes de Manutenção"
                subtitle="Manutenção preventiva"
                type="switch"
                value={settings.maintenanceReminders}
                onToggle={(value: boolean) => handleSettingChange('maintenanceReminders', value)}
              />
            </View>
          </View>

          {/* IoT & Sensors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>IoT e Sensores</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="hardware-chip-outline"
                title="Gerenciar Sensores"
                subtitle="Configurar dispositivos IoT"
                type="navigate"
                onPress={() => Alert.alert('Em Desenvolvimento', 'Esta funcionalidade estará disponível em breve.')}
              />
              <SettingItem
                icon="wifi-outline"
                title="Conectividade"
                subtitle="Status da conexão com sensores"
                type="navigate"
                onPress={() => Alert.alert('Em Desenvolvimento', 'Esta funcionalidade estará disponível em breve.')}
              />
              <SettingItem
                icon="speedometer-outline"
                title="Calibragem"
                subtitle="Calibrar sensores de umidade e pH"
                type="navigate"
                onPress={() => Alert.alert('Em Desenvolvimento', 'Esta funcionalidade estará disponível em breve.')}
              />
            </View>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suporte</Text>
            <View style={styles.settingsGroup}>
              <SettingItem
                icon="help-circle-outline"
                title="Central de Ajuda"
                subtitle="FAQ e tutoriais"
                type="navigate"
                onPress={() => Alert.alert('Em Desenvolvimento', 'Esta funcionalidade estará disponível em breve.')}
              />
              <SettingItem
                icon="mail-outline"
                title="Contato"
                subtitle="Entre em contato conosco"
                type="navigate"
                onPress={() => Alert.alert('Contato', 'Email: suporte@waterwise.com\nTelefone: (11) 99999-9999', [{ text: 'OK' }])}
              />
              <SettingItem
                icon="document-text-outline"
                title="Termos e Privacidade"
                subtitle="Políticas do aplicativo"
                type="navigate"
                onPress={() => Alert.alert('Em Desenvolvimento', 'Esta funcionalidade estará disponível em breve.')}
              />
              <SettingItem
                icon="star-outline"
                title="Avaliar o App"
                subtitle="Deixe sua avaliação"
                type="navigate"
                onPress={() => Alert.alert('Avaliar App', 'Obrigado pelo interesse! Em breve você poderá avaliar o WaterWise na loja de apps.', [{ text: 'OK' }])}
              />
            </View>
          </View>

          {/* Logout */}
          <View style={styles.section}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LinearGradient
                colors={['#F44336', '#D32F2F']}
                style={styles.logoutButtonGradient}
              >
                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                <Text style={styles.logoutButtonText}>Sair da Conta</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>WaterWise v1.0.0</Text>
            <Text style={styles.versionSubtext}>Global Solution 2025 - FIAP</Text>
            <Text style={styles.versionSubtext}>Integrado com Oracle Database</Text>
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
  placeholder: {
    width: 40,
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  profileCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3D3D3D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00FFCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 2,
  },
  profileCpfCnpj: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 2,
  },
  profilePhone: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 4,
  },
  profileProperty: {
    color: '#00FFCC',
    fontSize: 12,
    fontWeight: '500',
  },
  statusCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  statusValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingsGroup: {
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '400',
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '400',
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '400',
  },
  versionSubtext: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '400',
    marginTop: 2,
  },
});

export default SettingsScreen;