import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { getAuthToken, getUserData } from './src/services/api';
import Icon from './src/components/Icon';
import { colors, typography, radius } from './src/theme';

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

  const isHomeActive = screen === 'HOME';
  const isMapActive = screen === 'MAP';
  const isReportsActive = screen === 'MY_REPORTS' || screen === 'REPORT_DETAILS';
  const isAlertsActive = screen === 'ROAD_ALERTS' || screen === 'NOTIFICATIONS' || screen === 'ALERT_DETAILS';
  const isProfileActive =
    screen === 'PROFILE' ||
    screen === 'EDIT_PROFILE' ||
    screen === 'CHANGE_PASSWORD' ||
    screen === 'SETTINGS' ||
    screen === 'HELP_SUPPORT' ||
    screen === 'ABOUT' ||
    screen === 'PRIVACY_POLICY' ||
    screen === 'TERMS_CONDITIONS';

  const TAB_SCREENS: ScreenState[] = [
    'HOME',
    'MAP',
    'MY_REPORTS',
    'ROAD_ALERTS',
    'PROFILE',
    'REPORT',
    'EMERGENCY',
    'SAFETY_TIPS',
    'NOTIFICATIONS',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
          <ResetPasswordScreen email={resetEmail} onSuccess={() => setScreen('RESET_SUCCESS')} />
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
            onNavigateToMap={() => setScreen('MAP')}
            onNavigateToAlerts={() => setScreen('ROAD_ALERTS')}
            onNavigateToTips={() => setScreen('SAFETY_TIPS')}
          />
        )}

        {screen === 'REPORT' && (
          <ReportSubmitScreen
            initialType={reportType}
            onBack={() => setScreen('HOME')}
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

        {screen === 'MY_REPORTS' && (
          <MyReportsScreen
            onSelectReport={(report) => {
              setSelectedReport(report);
              setScreen('REPORT_DETAILS');
            }}
            onNewReport={() => {
              setReportType('ACCIDENT');
              setScreen('REPORT');
            }}
          />
        )}

        {screen === 'REPORT_DETAILS' && (
          <ReportDetailsScreen
            report={selectedReport}
            onBack={() => setScreen('MY_REPORTS')}
            onOpenMap={() => setScreen('MAP')}
          />
        )}

        {screen === 'MAP' && (
          <MapScreen
            onNavigateToReport={(type) => {
              setReportType(type);
              setScreen('REPORT');
            }}
          />
        )}

        {screen === 'EMERGENCY' && <EmergencyScreen onBack={() => setScreen('HOME')} />}

        {screen === 'ROAD_ALERTS' && (
          <NotificationsScreen
            onSelectAlert={(alert) => {
              setSelectedAlert(alert);
              setScreen('ALERT_DETAILS');
            }}
          />
        )}

        {screen === 'ALERT_DETAILS' && (
          <AlertDetailsScreen
            alert={selectedAlert}
            onBack={() => setScreen('ROAD_ALERTS')}
            onOpenMap={() => setScreen('MAP')}
          />
        )}

        {screen === 'SAFETY_TIPS' && (
          <SafetyTipsScreen
            onSelectTip={(tip) => {
              setSelectedTip(tip);
              setScreen('SAFETY_TIP_DETAILS');
            }}
            onBack={() => setScreen('HOME')}
          />
        )}

        {screen === 'SAFETY_TIP_DETAILS' && (
          <SafetyTipDetailsScreen tip={selectedTip} onBack={() => setScreen('SAFETY_TIPS')} />
        )}

        {screen === 'NOTIFICATIONS' && (
          <NotificationsScreen
            onSelectAlert={(alert) => {
              setSelectedAlert(alert);
              setScreen('ALERT_DETAILS');
            }}
          />
        )}

        {screen === 'PROFILE' && (
          <ProfileScreen onLogout={handleLogout} onNavigate={(target) => setScreen(target)} />
        )}

        {screen === 'EDIT_PROFILE' && (
          <EditProfileScreen
            user={user}
            onSave={() => setScreen('PROFILE')}
            onBack={() => setScreen('PROFILE')}
          />
        )}

        {screen === 'CHANGE_PASSWORD' && (
          <ChangePasswordScreen onBack={() => setScreen('PROFILE')} />
        )}

        {screen === 'SETTINGS' && <SettingsScreen onBack={() => setScreen('PROFILE')} />}

        {screen === 'HELP_SUPPORT' && <HelpSupportScreen onBack={() => setScreen('PROFILE')} />}

        {screen === 'ABOUT' && <AboutScreen onBack={() => setScreen('PROFILE')} />}

        {screen === 'PRIVACY_POLICY' && <PrivacyPolicyScreen onBack={() => setScreen('PROFILE')} />}

        {screen === 'TERMS_CONDITIONS' && (
          <TermsConditionsScreen onBack={() => setScreen('PROFILE')} />
        )}
      </View>

      {/* Google Material 3 Navigation Bar */}
      {TAB_SCREENS.includes(screen) && (
        <View style={styles.tabBar}>
          {/* Home */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setScreen('HOME')}
            activeOpacity={0.7}
          >
            <View style={[styles.pillContainer, isHomeActive && styles.pillActive]}>
              <Icon
                name={isHomeActive ? 'home-filled' : 'home'}
                size={20}
                color={isHomeActive ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={[styles.tabLabel, isHomeActive && styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>

          {/* Map */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setScreen('MAP')}
            activeOpacity={0.7}
          >
            <View style={[styles.pillContainer, isMapActive && styles.pillActive]}>
              <Icon
                name={isMapActive ? 'map-filled' : 'map'}
                size={20}
                color={isMapActive ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={[styles.tabLabel, isMapActive && styles.tabLabelActive]}>Live Map</Text>
          </TouchableOpacity>

          {/* Reports */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setScreen('MY_REPORTS')}
            activeOpacity={0.7}
          >
            <View style={[styles.pillContainer, isReportsActive && styles.pillActive]}>
              <Icon
                name={isReportsActive ? 'reports-filled' : 'reports'}
                size={20}
                color={isReportsActive ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={[styles.tabLabel, isReportsActive && styles.tabLabelActive]}>Reports</Text>
          </TouchableOpacity>

          {/* Alerts */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setScreen('ROAD_ALERTS')}
            activeOpacity={0.7}
          >
            <View style={[styles.pillContainer, isAlertsActive && styles.pillActive]}>
              <Icon
                name={isAlertsActive ? 'alerts-filled' : 'alerts'}
                size={20}
                color={isAlertsActive ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={[styles.tabLabel, isAlertsActive && styles.tabLabelActive]}>Alerts</Text>
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setScreen('PROFILE')}
            activeOpacity={0.7}
          >
            <View style={[styles.pillContainer, isProfileActive && styles.pillActive]}>
              <Icon
                name={isProfileActive ? 'profile-filled' : 'profile'}
                size={20}
                color={isProfileActive ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={[styles.tabLabel, isProfileActive && styles.tabLabelActive]}>Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContainer: {
    width: 48,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  pillActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
