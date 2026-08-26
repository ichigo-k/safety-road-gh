import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { getAuthToken, getUserData } from './src/services/api';
import Icon from './src/components/Icon';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import ResetSuccessScreen from './src/screens/ResetSuccessScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';

import HomeScreen from './src/screens/HomeScreen';
import ReportSubmitScreen from './src/screens/ReportSubmitScreen';
import LocationPickerScreen from './src/screens/LocationPickerScreen';
import ReportSubmittedScreen from './src/screens/ReportSubmittedScreen';
import MyReportsScreen from './src/screens/MyReportsScreen';
import ReportDetailsScreen from './src/screens/ReportDetailsScreen';
import MapScreen from './src/screens/MapScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import AlertDetailsScreen from './src/screens/AlertDetailsScreen';
import SafetyTipsScreen from './src/screens/SafetyTipsScreen';
import SafetyTipDetailsScreen from './src/screens/SafetyTipDetailsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HelpSupportScreen from './src/screens/HelpSupportScreen';
import AboutScreen from './src/screens/AboutScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsConditionsScreen from './src/screens/TermsConditionsScreen';

export type ScreenState =
  | 'SPLASH'
  | 'ONBOARDING'
  | 'AUTH'
  | 'FORGOT_PASSWORD'
  | 'RESET_PASSWORD'
  | 'RESET_SUCCESS'
  | 'EMAIL_VERIFICATION'
  | 'HOME'
  | 'REPORT'
  | 'LOCATION_PICKER'
  | 'REPORT_SUBMITTED'
  | 'MY_REPORTS'
  | 'REPORT_DETAILS'
  | 'MAP'
  | 'EMERGENCY'
  | 'ROAD_ALERTS'
  | 'ALERT_DETAILS'
  | 'SAFETY_TIPS'
  | 'SAFETY_TIP_DETAILS'
  | 'NOTIFICATIONS'
  | 'PROFILE'
  | 'EDIT_PROFILE'
  | 'CHANGE_PASSWORD'
  | 'SETTINGS'
  | 'HELP_SUPPORT'
  | 'ABOUT'
  | 'PRIVACY_POLICY'
  | 'TERMS_CONDITIONS';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('SPLASH');
  const [user, setUser] = useState<any>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [selectedTip, setSelectedTip] = useState<any>(null);
  const [reportType, setReportType] = useState<'ACCIDENT' | 'HAZARD'>('ACCIDENT');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getAuthToken();
      const userData = await getUserData();
      if (userData) setUser(userData);
      if (token) {
        setScreen('HOME');
      }
    } catch (e) {}
  };

  const handleFinishSplash = () => {
    setScreen('ONBOARDING');
  };

  const handleFinishOnboarding = () => {
    setScreen('AUTH');
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setScreen('HOME');
  };

  const handleLogout = () => {
    setUser(null);
    setScreen('AUTH');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {screen === 'SPLASH' && <SplashScreen onFinish={handleFinishSplash} />}

        {screen === 'ONBOARDING' && <OnboardingScreen onFinish={handleFinishOnboarding} />}

        {screen === 'AUTH' && <AuthScreen onLoginSuccess={handleLoginSuccess} />}

        {screen === 'FORGOT_PASSWORD' && (
          <ForgotPasswordScreen
            onCodeSent={(email) => {
              setResetEmail(email);
              setScreen('RESET_PASSWORD');
            }}
            onBackToLogin={() => setScreen('AUTH')}
          />
        )}

        {screen === 'RESET_PASSWORD' && (
          <ResetPasswordScreen
            email={resetEmail}
            onSuccess={() => setScreen('RESET_SUCCESS')}
          />
        )}

        {screen === 'RESET_SUCCESS' && (
          <ResetSuccessScreen onBackToLogin={() => setScreen('AUTH')} />
        )}

        {screen === 'EMAIL_VERIFICATION' && (
          <EmailVerificationScreen
            email={user?.email || 'user@safetyroad.gov.gh'}
            onVerified={() => setScreen('HOME')}
          />
        )}

        {screen === 'HOME' && (
          <HomeScreen
            onNavigateToReport={(type) => {
              setReportType(type);
              setScreen('REPORT');
            }}
            onNavigateToEmergency={() => setScreen('EMERGENCY')}
          />
        )}

        {screen === 'REPORT' && (
          <ReportSubmitScreen
            initialType={reportType}
            onSuccess={() => setScreen('REPORT_SUBMITTED')}
          />
        )}

        {screen === 'LOCATION_PICKER' && (
          <LocationPickerScreen
            onLocationSelected={(name, lat, lng) => setScreen('REPORT')}
            onCancel={() => setScreen('REPORT')}
          />
        )}

        {screen === 'REPORT_SUBMITTED' && (
          <ReportSubmittedScreen
            onGoToTracking={() => setScreen('MY_REPORTS')}
            onGoHome={() => setScreen('HOME')}
          />
        )}

        {screen === 'MY_REPORTS' && <MyReportsScreen />}

        {screen === 'REPORT_DETAILS' && (
          <ReportDetailsScreen report={selectedReport} onBack={() => setScreen('MY_REPORTS')} />
        )}

        {screen === 'MAP' && <MapScreen />}

        {screen === 'EMERGENCY' && <EmergencyScreen />}

        {screen === 'ROAD_ALERTS' && (
          <HomeScreen
            onNavigateToReport={(type) => {
              setReportType(type);
              setScreen('REPORT');
            }}
            onNavigateToEmergency={() => setScreen('EMERGENCY')}
          />
        )}

        {screen === 'ALERT_DETAILS' && (
          <AlertDetailsScreen alert={selectedAlert} onBack={() => setScreen('HOME')} />
        )}

        {screen === 'SAFETY_TIPS' && <SafetyTipsScreen />}
        {screen === 'SAFETY_TIP_DETAILS' && (
          <SafetyTipDetailsScreen tip={selectedTip} onBack={() => setScreen('SAFETY_TIPS')} />
        )}

        {screen === 'NOTIFICATIONS' && <NotificationsScreen />}

        {screen === 'PROFILE' && <ProfileScreen onLogout={handleLogout} />}

        {screen === 'EDIT_PROFILE' && (
          <EditProfileScreen user={user} onSave={() => setScreen('PROFILE')} onBack={() => setScreen('PROFILE')} />
        )}

        {screen === 'CHANGE_PASSWORD' && (
          <ChangePasswordScreen onBack={() => setScreen('PROFILE')} />
        )}

        {screen === 'SETTINGS' && (
          <SettingsScreen onBack={() => setScreen('PROFILE')} />
        )}

        {screen === 'HELP_SUPPORT' && (
          <HelpSupportScreen onBack={() => setScreen('PROFILE')} />
        )}

        {screen === 'ABOUT' && (
          <AboutScreen onBack={() => setScreen('PROFILE')} />
        )}

        {screen === 'PRIVACY_POLICY' && (
          <PrivacyPolicyScreen onBack={() => setScreen('PROFILE')} />
        )}

        {screen === 'TERMS_CONDITIONS' && (
          <TermsConditionsScreen onBack={() => setScreen('PROFILE')} />
        )}
      </View>

      {/* Vector Icon Bottom Navigation Bar: Home | Map | Reports | Alerts | Profile */}
      {['HOME', 'MAP', 'MY_REPORTS', 'ROAD_ALERTS', 'PROFILE', 'REPORT', 'EMERGENCY', 'SAFETY_TIPS', 'NOTIFICATIONS'].includes(screen) && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, (screen === 'HOME' || screen === 'REPORT' || screen === 'EMERGENCY') && styles.activeTabItem]}
            onPress={() => setScreen('HOME')}
          >
            <Icon
              name="home"
              size={18}
              color={(screen === 'HOME' || screen === 'REPORT' || screen === 'EMERGENCY') ? '#f59e0b' : '#94a3b8'}
            />
            <Text style={[styles.tabLabel, (screen === 'HOME' || screen === 'REPORT' || screen === 'EMERGENCY') && styles.activeTabLabel]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, screen === 'MAP' && styles.activeTabItem]}
            onPress={() => setScreen('MAP')}
          >
            <Icon name="map" size={18} color={screen === 'MAP' ? '#f59e0b' : '#94a3b8'} />
            <Text style={[styles.tabLabel, screen === 'MAP' && styles.activeTabLabel]}>Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, screen === 'MY_REPORTS' && styles.activeTabItem]}
            onPress={() => setScreen('MY_REPORTS')}
          >
            <Icon name="reports" size={18} color={screen === 'MY_REPORTS' ? '#f59e0b' : '#94a3b8'} />
            <Text style={[styles.tabLabel, screen === 'MY_REPORTS' && styles.activeTabLabel]}>Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, screen === 'ROAD_ALERTS' && styles.activeTabItem]}
            onPress={() => setScreen('ROAD_ALERTS')}
          >
            <Icon name="alerts" size={18} color={screen === 'ROAD_ALERTS' ? '#f59e0b' : '#94a3b8'} />
            <Text style={[styles.tabLabel, screen === 'ROAD_ALERTS' && styles.activeTabLabel]}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, screen === 'PROFILE' && styles.activeTabItem]}
            onPress={() => setScreen('PROFILE')}
          >
            <Icon name="profile" size={18} color={screen === 'PROFILE' ? '#f59e0b' : '#94a3b8'} />
            <Text style={[styles.tabLabel, screen === 'PROFILE' && styles.activeTabLabel]}>Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeTabItem: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#f59e0b',
  },
});
