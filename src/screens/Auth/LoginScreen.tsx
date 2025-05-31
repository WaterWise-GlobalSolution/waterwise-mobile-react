import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  
  const { login, quickLogin, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigation.navigate('Dashboard');
    }
  }, [isAuthenticated, loading]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Erro', 'Email ou senha incorretos');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha na conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      const success = await quickLogin();
      if (success) {
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Erro', 'Falha no login rápido');
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha no login rápido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('RegisterUser');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FFCC" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
        style={styles.gradient}
      >
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
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#CCCCCC"
                  />
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                style={styles.loginButton}
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
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
              </TouchableOpacity>
            </View>

                          {/* Dev Quick Login - APENAS PARA DESENVOLVIMENTO */}
              <TouchableOpacity
                onPress={handleQuickLogin}
                style={styles.quickLoginButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FF9800" size="small" />
                ) : (
                  <Text style={styles.quickLoginText}>🚀 Login Rápido (DEV)</Text>
                )}
              </TouchableOpacity>

              {/* Register Section */}
              <View style={styles.registerSection}>
                <Text style={styles.registerText}>Não tem uma conta?</Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text style={styles.registerLink}>Cadastre-se</Text>
                </TouchableOpacity>
              </View>
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
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#00FFCC',
    fontSize: 14,
    fontWeight: '500',
  },
  quickLoginButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  quickLoginText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
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
});

export default LoginScreen;