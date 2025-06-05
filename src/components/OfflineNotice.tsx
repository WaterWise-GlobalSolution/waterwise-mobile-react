import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface OfflineNoticeProps {
  visible?: boolean;
  onDismiss?: () => void;
}

const OfflineNotice: React.FC<OfflineNoticeProps> = ({ 
  visible = true, 
  onDismiss 
}) => {
  const { isOnline, syncData } = useAuth();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isOnline && visible) {
      showNotice();
    } else {
      hideNotice();
    }
  }, [isOnline, visible]);

  const showNotice = () => {
    setIsVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const hideNotice = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  const handleDismiss = () => {
    hideNotice();
    if (onDismiss) onDismiss();
  };

  const handleSync = async () => {
    try {
      await syncData();
      if (isOnline) {
        hideNotice();
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  if (!isVisible && isOnline) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(255, 152, 0, 0.95)', 'rgba(255, 193, 7, 0.95)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Modo Offline</Text>
            <Text style={styles.subtitle}>
              Dados salvos localmente • Conecte-se para sincronizar
            </Text>
          </View>

          <View style={styles.actionsContainer}>
            {isOnline && (
              <TouchableOpacity onPress={handleSync} style={styles.syncButton}>
                <Ionicons name="sync" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 50, // Espaço para status bar
  },
  gradient: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '400',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButton: {
    padding: 8,
    marginRight: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dismissButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default OfflineNotice;