import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RegisterUserScreenProps {
  navigation: any;
}

const RegisterUserScreen: React.FC<RegisterUserScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpfCnpj: '',
    email: '',
    telefone: '',
    senha: '',
    confirmSenha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCpfCnpj = (value: string) => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 11) {
      // Formato CPF: 000.000.000-00
      return cleanValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      // Formato CNPJ: 00.000.000/0000-00
      return cleanValue
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
  };

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length <= 10) {
      // Formato: (00) 0000-0000
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    } else {
      // Formato: (00) 00000-0000
      return cleanValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
  };

  const validateCpfCnpj = (cpfCnpj: string) => {
    const cleanValue = cpfCnpj.replace(/\D/g, '');
    
    if (cleanValue.length === 11) {
      // Validação básica de CPF
      if (/^(\d)\1{10}$/.test(cleanValue)) return false; // Todos os dígitos iguais
      return true; // Para demonstração, aceita qualquer CPF com 11 dígitos únicos
    } else if (cleanValue.length === 14) {
      // Validação básica de CNPJ
      if (/^(\d)\1{13}$/.test(cleanValue)) return false; // Todos os dígitos iguais
      return true; // Para demonstração, aceita qualquer CNPJ com 14 dígitos únicos
    }
    
    return false;
  };

  const validateForm = () => {
    const { nomeCompleto, cpfCnpj, email, telefone, senha, confirmSenha } = formData;

    if (!nomeCompleto.trim()) {
      Alert.alert('Erro', 'Nome completo é obrigatório');
      return false;
    }

    if (nomeCompleto.trim().length < 3) {
      Alert.alert('Erro', 'Nome deve ter pelo menos 3 caracteres');
      return false;
    }

    if (!cpfCnpj.trim()) {
      Alert.alert('Erro', 'CPF ou CNPJ é obrigatório');
      return false;
    }

    if (!validateCpfCnpj(cpfCnpj)) {
      Alert.alert('Erro', 'CPF ou CNPJ inválido');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Email inválido');
      return false;
    }

    if (telefone && telefone.replace(/\D/g, '').length < 10) {
      Alert.alert('Erro', 'Telefone deve ter pelo menos 10 dígitos');
      return false;
    }

    if (!senha) {
      Alert.alert('Erro', 'Senha é obrigatória');
      return false;
    }

    if (senha.length < 6) {
      Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    // Verificar se tem pelo menos uma letra e um número
    const hasLetter = /[a-zA-Z]/.test(senha);
    const hasNumber = /[0-9]/.test(senha);
    
    if (!hasLetter || !hasNumber) {
      Alert.alert('Erro', 'Senha deve conter pelo menos uma letra e um número');
      return false;
    }

    if (senha !== confirmSenha) {
      Alert.alert('Erro', 'Senhas não conferem');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Dados do produtor rural para enviar para a próxima tela
      const produtorData = {
        nome_completo: formData.nomeCompleto.trim(),
        cpf_cnpj: formData.cpfCnpj.replace(/\D/g, ''), // Remove formatação
        email: formData.email.toLowerCase().trim(),
        telefone: formData.telefone.replace(/\D/g, '') || null, // Remove formatação ou null se vazio
        senha: formData.senha, // Em produção, será hasheada no backend
        data_cadastro: new Date().toISOString(),
        status_ativo: 'S'
      };

      navigation.navigate('RegisterAddress', { produtorData });
    }
  };

  const handleBack = () => {
    navigation.goBack();
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

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressText}>Passo 1 de 2</Text>
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
              <Text style={styles.title}>Produtor Rural</Text>
              <Text style={styles.subtitle}>Cadastre seus dados pessoais</Text>

              {/* Nome Completo Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor="#888888"
                  value={formData.nomeCompleto}
                  onChangeText={(value) => handleInputChange('nomeCompleto', value)}
                  autoCapitalize="words"
                  maxLength={100}
                />
              </View>

              {/* CPF/CNPJ Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="card-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="CPF ou CNPJ"
                  placeholderTextColor="#888888"
                  value={formData.cpfCnpj}
                  onChangeText={(value) => handleInputChange('cpfCnpj', formatCpfCnpj(value))}
                  keyboardType="numeric"
                  maxLength={18}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888888"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  maxLength={100}
                />
              </View>

              {/* Telefone Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Telefone (opcional)"
                  placeholderTextColor="#888888"
                  value={formData.telefone}
                  onChangeText={(value) => handleInputChange('telefone', formatPhone(value))}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
              </View>

              {/* Senha Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#888888"
                  value={formData.senha}
                  onChangeText={(value) => handleInputChange('senha', value)}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
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

              {/* Confirmar Senha Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#CCCCCC" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar senha"
                  placeholderTextColor="#888888"
                  value={formData.confirmSenha}
                  onChangeText={(value) => handleInputChange('confirmSenha', value)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#CCCCCC"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Requirements */}
              {formData.senha.length > 0 && (
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Requisitos da senha:</Text>
                  <View style={styles.requirementRow}>
                    <Text style={[
                      styles.requirementItem,
                      formData.senha.length >= 6 ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      {formData.senha.length >= 6 ? '✓' : '○'} Mínimo de 6 caracteres ({formData.senha.length}/6)
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Text style={[
                      styles.requirementItem,
                      /(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.senha) ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      {/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.senha) ? '✓' : '○'} Combine letras e números
                    </Text>
                  </View>
                  <View style={styles.requirementRow}>
                    <Text style={[
                      styles.requirementItem,
                      formData.senha === formData.confirmSenha && formData.confirmSenha.length > 0 ? styles.requirementMet : styles.requirementNotMet
                    ]}>
                      {formData.senha === formData.confirmSenha && formData.confirmSenha.length > 0 ? '✓' : '○'} Senhas conferem
                    </Text>
                  </View>
                </View>
              )}

              {/* Info sobre CPF/CNPJ */}
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle-outline" size={16} color="#00FFCC" />
                <Text style={styles.infoText}>
                  Pessoa Física: use seu CPF {'\n'}
                  Pessoa Jurídica: use seu CNPJ
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Next Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <LinearGradient
                colors={['#00FFCC', '#00D4AA']}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>Próximo</Text>
                <Ionicons name="arrow-forward" size={20} color="#1A1A1A" style={styles.nextButtonIcon} />
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
  requirementsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#2D2D2D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3D3D3D',
  },
  requirementsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    marginBottom: 4,
  },
  requirementRow: {
    marginBottom: 4,
  },
  requirementMet: {
    color: '#4CAF50',
    fontSize: 12,
  },
  requirementNotMet: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.3)',
  },
  infoText: {
    color: '#00FFCC',
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
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  nextButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButtonIcon: {
    marginLeft: 8,
  },
});

export default RegisterUserScreen;