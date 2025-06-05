import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Import screens
import WelcomeScreen from './src/screens/Welcome/WelcomeScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterUserScreen from './src/screens/Auth/RegisterUserScreen';
import RegisterAddressScreen from './src/screens/Auth/RegisterAddressScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import ReportsScreen from './src/screens/Reports/ReportsScreen';
import SensorsScreen from './src/screens/Sensors/SensorsScreen';
import SoilImprovementScreen from './src/screens/SoilImprovement/SoilImprovementScreen';

// Import context
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  RegisterUser: undefined;
  RegisterAddress: {
    produtorData?: any;
  } | undefined;
  Dashboard: undefined;
  Settings: undefined;
  Reports: undefined;
  Sensors: undefined;
  SoilImprovement: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Componente separado para gerenciar navegação com acesso ao contexto
const AppNavigator: React.FC = () => {
  const { isAuthenticated, initialized, loading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    // App só está pronto quando o AuthContext está inicializado
    // E quando sabemos se é primeiro acesso
    if (initialized && isFirstLaunch !== null) {
      setAppReady(true);
      console.log('🎯 App pronto - initialized:', initialized, 'isFirstLaunch:', isFirstLaunch, 'isAuthenticated:', isAuthenticated);
    }
  }, [initialized, isFirstLaunch, isAuthenticated]);

  const checkFirstLaunch = async () => {
    try {
      console.log('🔍 Verificando primeiro acesso...');
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      
      if (hasLaunched === null) {
        console.log('🆕 Primeiro acesso detectado');
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        console.log('🔄 Usuário retornando');
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('❌ Erro verificando primeiro acesso:', error);
      setIsFirstLaunch(true);
    }
  };

  // Mostrar loading até que tudo esteja pronto
  if (!appReady || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FFCC" />
      </View>
    );
  }

  // Determinar tela inicial baseado no estado
  const getInitialRouteName = () => {
    if (isAuthenticated) {
      console.log('🎯 Usuário autenticado -> Dashboard');
      return 'Dashboard';
    } else if (isFirstLaunch) {
      console.log('🎯 Primeiro acesso -> Welcome');
      return 'Welcome';
    } else {
      console.log('🎯 Usuário retornando -> Login');
      return 'Login';
    }
  };

  const initialRouteName = getInitialRouteName();

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyle: { backgroundColor: '#1A1A1A' },
        }}
        initialRouteName={initialRouteName}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{ animationTypeForReplace: 'push' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ animationTypeForReplace: 'push' }}
        />
        <Stack.Screen 
          name="RegisterUser" 
          component={RegisterUserScreen}
          options={{ 
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
        <Stack.Screen 
          name="RegisterAddress" 
          component={RegisterAddressScreen}
          options={{ 
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ 
            gestureEnabled: false,
            cardStyleInterpolator: ({ current }) => {
              return {
                cardStyle: {
                  opacity: current.progress,
                },
              };
            },
          }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
        <Stack.Screen 
          name="Reports" 
          component={ReportsScreen}
          options={{ 
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
        <Stack.Screen 
          name="Sensors" 
          component={SensorsScreen}
          options={{ 
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
        <Stack.Screen 
          name="SoilImprovement" 
          component={SoilImprovementScreen}
          options={{ 
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
});