import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  
  const { login, isAuthenticated, loading, isOnline, initialized } = useAuth();

  // Verificar autenticação quando a tela recebe foco
  useFocusEffect(
    React.useCallback(() => {
      if (initialized && isAuthenticated && !loading) {
        console.log('🎯 LoginScreen: Usuário já autenticado, redirecionando...');
        navigation.replace('Dashboard');
      }
    }, [initialized, isAuthenticated, loading, navigation])
  );

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Erro', 'Por favor, informe um email válido');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, informe sua senha');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      console.log('🔑 Iniciando processo de login...');
      const success = await login(email, password);
      
      if (success) {
        console.log('✅ Login realizado com sucesso, navegando para Dashboard');
        navigation.replace('Dashboard');
      } else {
        const message = isOnline 
          ? 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.' 
          : 'Credenciais não encontradas offline. Conecte-se à internet para fazer login ou verifique se você já fez login anteriormente neste dispositivo.';
        
        Alert.alert('Erro no Login', message);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert(
        'Erro de Conexão', 
        isOnline 
          ? 'Falha na conexão com o servidor. Verifique sua internet e tente novamente.' 
          : 'Não foi possível fazer login offline. Conecte-se à internet ou verifique suas credenciais salvas.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    if (isLoading) return;
    navigation.navigate('RegisterUser');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Senha',
      isOnline 
        ? 'Entre em contato com o suporte através do email: suporte@waterwise.com para recuperar sua senha.'
        : 'Recuperação de senha não disponível offline. Conecte-se à internet e tente novamente.',
      [{ text: 'OK' }]
    );
  };

  // Mostrar loading se estiver carregando ou se o contexto não foi inicializado
  if (loading || !initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FFCC" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
        style={styles.gradient}
      >
        {/* Status de Conexão */}
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

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>
                <Text style={styles.logoRegular}>W</Text>
                <Text style={styles.logoHighlight}>A</Text>
                <Text style={styles.logoRegular}>TERW</Text>
                <Text style={styles.logoHighlight}>I</Text>
                <Text style={styles.logoRegular}>SE</Text>
              </Text>
              <Text style={styles.subtitle}>Gestão Inteligente de Água</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Bem-vindo de volta!</Text>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#888888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#CCCCCC"
                  />
                </TouchableOpacity>
              </View>

              {/* Offline Notice */}
              {!isOnline && (
                <View style={styles.offlineNotice}>
                  <Ionicons name="information-circle-outline" size={16} color="#FF9800" />
                  <Text style={styles.offlineNoticeText}>
                    Modo offline ativo. Apenas contas salvas anteriormente podem fazer login.
                  </Text>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                style={[styles.loginButton, isLoading && styles.disabledButton]}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#00FFCC', '#00D4AA']}
                  style={styles.loginButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#1A1A1A" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Entrar</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Forgot Password */}
              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
              </TouchableOpacity>
            </View>

            {/* Register Section */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>Não tem uma conta?</Text>
              <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                <Text style={styles.registerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>

            {/* API Info */}
            {isOnline && (
              <View style={styles.apiInfo}>
                <Text style={styles.apiInfoText}>
                  Conectado ao servidor WaterWise
                </Text>
              </View>
            )}
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
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  loadingText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginTop: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoRegular: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logoHighlight: {
    color: '#00FFCC',
    fontWeight: '700',
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '400',
  },
  formContainer: {
    marginBottom: 40,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#3D3D3D',
    position: 'relative',
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
  eyeIcon: {
    padding: 4,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#00FFCC',
    fontSize: 14,
    fontWeight: '500',
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginRight: 4,
  },
  registerLink: {
    color: '#00FFCC',
    fontSize: 16,
    fontWeight: '600',
  },
  apiInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  apiInfoText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '400',
  },
});

export default LoginScreen;