import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function AuthLayout({ children }) {
  if (!isTablet) {
    // Mobile view - full screen form
    return (
      <View style={styles.mobileContainer}>
        {children}
      </View>
    );
  }

  // Tablet view - split screen
  return (
    <View style={styles.container}>
      {/* Left Side - Branding */}
      <LinearGradient
        colors={['#0A1E42', '#1E3A5F', '#0A1E42']}
        style={styles.leftSide}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.brandingContainer}>
          {/* Logo placeholder - thay bằng logo của bạn */}
          <View style={styles.logoCircle}>
            <View style={styles.logoInner} />
          </View>
          
          <View style={styles.brandingText}>
            <View style={styles.titleContainer}>
              <View style={styles.accentBar} />
              <View>
                <View style={styles.titleRow}>
                  <View style={styles.titleDot} />
                  <View style={styles.titleLine} />
                </View>
                <View style={[styles.titleRow, { marginTop: 8 }]}>
                  <View style={styles.titleLine} />
                  <View style={styles.titleDot} />
                </View>
              </View>
            </View>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <View style={styles.featureLine} />
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <View style={styles.featureLine} />
              </View>
              <View style={styles.featureItem}>
                <View style={styles.featureDot} />
                <View style={styles.featureLine} />
              </View>
            </View>
          </View>

          {/* Decorative elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
        </View>
      </LinearGradient>

      {/* Right Side - Form */}
      <View style={styles.rightSide}>
        <View style={styles.formWrapper}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  leftSide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  brandingContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 60,
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
  },
  brandingText: {
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  accentBar: {
    width: 4,
    height: 80,
    backgroundColor: '#60A5FA',
    marginRight: 20,
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#60A5FA',
    marginRight: 12,
  },
  titleLine: {
    width: 120,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 4,
  },
  featuresContainer: {
    alignItems: 'flex-start',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#60A5FA',
    marginRight: 12,
  },
  featureLine: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 3,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    top: -100,
    left: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -50,
    right: -50,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(96, 165, 250, 0.08)',
    top: '50%',
    right: 50,
  },
  rightSide: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 480,
  },
});