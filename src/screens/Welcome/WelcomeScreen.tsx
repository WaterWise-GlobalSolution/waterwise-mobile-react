import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

const welcomeData = [
  {
    id: 1,
    title: 'Bem-vindo ao WaterWise',
    description: 'Gerencie seus recursos hídricos de forma inteligente e sustentável',
    icon: 'water-outline',
  },
  {
    id: 2,
    title: 'Monitoramento Inteligente',
    description: 'Acompanhe em tempo real o uso da água em sua propriedade rural',
    icon: 'analytics-outline',
  },
  {
    id: 3,
    title: 'Economia e Sustentabilidade',
    description: 'Otimize o uso da água e reduza custos com nossa tecnologia avançada',
    icon: 'leaf-outline',
  },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (currentPage < welcomeData.length - 1) {
      const nextPage = currentPage + 1;
      pagerRef.current?.setPage(nextPage);
      setCurrentPage(nextPage);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const handlePageSelected = (e: any) => {
    setCurrentPage(e.nativeEvent.position);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#1A1A1A', '#2D2D2D', '#1A1A1A']}
        style={styles.gradient}
      >
        {/* Header with Skip button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            <Text style={styles.logoRegular}>W</Text>
            <Text style={styles.logoHighlight}>A</Text>
            <Text style={styles.logoRegular}>TERW</Text>
            <Text style={styles.logoHighlight}>I</Text>
            <Text style={styles.logoRegular}>SE</Text>
          </Text>
        </View>

        {/* PagerView */}
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {welcomeData.map((item) => (
            <View key={item.id} style={styles.page}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={item.icon as any}
                  size={120}
                  color="#00FFCC"
                />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          ))}
        </PagerView>

        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {welcomeData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentPage === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={['#00FFCC', '#00D4AA']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentPage === welcomeData.length - 1 ? 'Começar' : 'Próximo'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#1A1A1A"
              style={styles.nextButtonIcon}
            />
          </LinearGradient>
        </TouchableOpacity>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  logoRegular: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logoHighlight: {
    color: '#00FFCC',
    fontWeight: '700',
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
    padding: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#444444',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#00FFCC',
    width: 24,
  },
  nextButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
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

export default WelcomeScreen;