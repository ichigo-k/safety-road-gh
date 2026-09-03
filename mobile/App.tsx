import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { getAuthToken, getUserData } from './src/services/api';
import TabBar, { ReportFab, TabItem } from './src/components/TabBar';
import { colors } from './src/theme';
import { AreaProvider } from './src/services/area';

// Side-effect import: registers the background geofence task.
//
// TaskManager.defineTask must run while the JS bundle is first evaluated. When
// the OS relaunches a killed app to hand it a location update, no screen has
// mounted yet — so importing this from SettingsScreen alone would mean the
// task is undefined at exactly the moment it is needed, and the fix is
// silently dropped. It has to be reachable from the entry point.
import './src/services/backgroundGeofence';

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
import AreaPickerScreen from './src/screens/AreaPickerScreen';
import RoutePreviewScreen from './src/screens/RoutePreviewScreen';
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
  | 'ROUTE_PREVIEW'
  | 'AREA_PICKER'
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
  const hasSession = useRef(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getAuthToken();
      const userData = await getUserData();
      if (userData) setUser(userData);
      hasSession.current = !!token;
      if (token) {
        setScreen('HOME');
      }
    } catch (e) {}
  };

  // The splash timer resolves after checkAuth, so without this guard it would
  // overwrite the authenticated redirect and send a signed-in user back
  // through onboarding.
  const handleFinishSplash = () => {
    setScreen(hasSession.current ? 'HOME' : 'ONBOARDING');
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

  // Which tab lights up for the current screen — detail screens keep their
  // parent tab active.
  const TAB_OWNERS: Record<string, ScreenState[]> = {
    HOME: ['HOME', 'AREA_PICKER'],
    MAP: ['MAP', 'ROUTE_PREVIEW'],
    MY_REPORTS: ['MY_REPORTS', 'REPORT_DETAILS'],
    ROAD_ALERTS: ['ROAD_ALERTS', 'NOTIFICATIONS', 'ALERT_DETAILS'],
    PROFILE: [
      'PROFILE',
      'EDIT_PROFILE',
      'CHANGE_PASSWORD',
      'SETTINGS',
      'HELP_SUPPORT',
      'ABOUT',
      'PRIVACY_POLICY',
      'TERMS_CONDITIONS',
    ],
  };

  const activeTabKey =
    Object.keys(TAB_OWNERS).find((key) => TAB_OWNERS[key].includes(screen)) ?? '';

  const TAB_ITEMS: TabItem[] = [
    { key: 'HOME', label: 'Home', icon: 'home' },
    { key: 'MAP', label: 'Live Map', icon: 'map' },
    { key: 'MY_REPORTS', label: 'Reports', icon: 'reports' },
    { key: 'ROAD_ALERTS', label: 'Alerts', icon: 'alerts' },
    { key: 'PROFILE', label: 'Profile', icon: 'profile' },
  ];

  const TAB_SCREENS: ScreenState[] = [
    'HOME',
    'AREA_PICKER',
    'MAP',
    'ROUTE_PREVIEW',
    'MY_REPORTS',
    'ROAD_ALERTS',
    'PROFILE',
    'REPORT',
    'EMERGENCY',
    'SAFETY_TIPS',
    'NOTIFICATIONS',
  ];

  return (
    <AreaProvider>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        {screen === 'SPLASH' && <SplashScreen onFinish={handleFinishSplash} />}

        {screen === 'ONBOARDING' && <OnboardingScreen onFinish={handleFinishOnboarding} />}

        {screen === 'AUTH' && (
          <AuthScreen
            onLoginSuccess={handleLoginSuccess}
            onForgotPassword={() => setScreen('FORGOT_PASSWORD')}
          />
        )}

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
            onNavigateToRoute={() => setScreen('ROUTE_PREVIEW')}
            onChangeArea={() => setScreen('AREA_PICKER')}
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

        {screen === 'ROUTE_PREVIEW' && (
          <RoutePreviewScreen onBack={() => setScreen('HOME')} />
        )}

        {screen === 'AREA_PICKER' && <AreaPickerScreen onDone={() => setScreen('HOME')} />}

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

        {/* Quick-report FAB — only on the map, where nothing else offers this
            action. Home already leads with its two report tiles. */}
        {screen === 'MAP' && (
          <ReportFab
            onPress={() => {
              setReportType('ACCIDENT');
              setScreen('REPORT');
            }}
          />
        )}
      </View>

      {TAB_SCREENS.includes(screen) && (
        <TabBar
          items={TAB_ITEMS}
          activeKey={activeTabKey}
          onSelect={(key) => setScreen(key as ScreenState)}
        />
      )}
    </SafeAreaView>
    </AreaProvider>
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
});
