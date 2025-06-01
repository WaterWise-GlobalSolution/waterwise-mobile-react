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
import { StackScreenProps } from '@react-navigation/stack';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';

// Import context
import { AuthProvider } from './src/contexts/AuthContext';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  RegisterUser: undefined;
  RegisterAddress: undefined;
  Dashboard: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FFCC" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator 
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyle: { backgroundColor: '#1A1A1A' },
          }}
          initialRouteName={isFirstLaunch ? 'Welcome' : 'Login'}
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
        </Stack.Navigator>
      </NavigationContainer>
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