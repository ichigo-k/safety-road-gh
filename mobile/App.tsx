import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BackHandler, Platform, StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { getAuthToken, getUserData, removeAuthToken, removeUserData, setUnauthorizedHandler } from './src/services/api';
import TabBar, { ReportFab, TabItem } from './src/components/TabBar';
import { colors, spacing } from './src/theme';
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

/* ── Top inset ────────────────────────────────────────────────────────
 * React Native's SafeAreaView only insets on iOS — on Android it is a plain
 * View. Android has drawn edge-to-edge by default since Expo SDK 54, so
 * every screen's content started flush against the status bar and clock.
 *
 * Pad the shell once here instead of touching all 28 screens. iOS gets only
 * the small breathing gap, since SafeAreaView already clears the notch.
 * ────────────────────────────────────────────────────────────── */
const TOP_INSET =
  (Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0) + spacing.sm;

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('SPLASH');
  const [user, setUser] = useState<any>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [selectedTip, setSelectedTip] = useState<any>(null);
  const [reportType, setReportType] = useState<'ACCIDENT' | 'HAZARD'>('ACCIDENT');
  const hasSession = useRef(false);

  /* ── Screens that require a valid session ───────────────────────────────
   * Pre-auth screens (SPLASH, ONBOARDING, AUTH, password reset flow) are
   * intentionally absent. Everything else is gated.
   * ---------------------------------------------------------------------- */
  const PROTECTED_SCREENS = new Set<ScreenState>([
    'HOME', 'REPORT', 'LOCATION_PICKER', 'REPORT_SUBMITTED',
    'MY_REPORTS', 'REPORT_DETAILS', 'MAP', 'ROUTE_PREVIEW',
    'AREA_PICKER', 'EMERGENCY', 'ROAD_ALERTS', 'ALERT_DETAILS',
    'SAFETY_TIPS', 'SAFETY_TIP_DETAILS', 'NOTIFICATIONS',
    'PROFILE', 'EDIT_PROFILE', 'CHANGE_PASSWORD',
    'SETTINGS', 'HELP_SUPPORT', 'ABOUT', 'PRIVACY_POLICY', 'TERMS_CONDITIONS',
  ]);

  /* ── Navigation history ─────────────────────────────────────────────
   *
   * Screens are one piece of state with no stack behind them, so Android's
   * back gesture had nothing to pop and fell through to the OS — every back
   * swipe closed the app, no matter how deep you were. Only the on-screen
   * back arrows worked, because they call setScreen explicitly.
   *
   * This keeps the trail of screens actually visited. Back pops it; when it
   * is empty the gesture falls through and closes the app, which is what
   * Android users expect at a root screen.
   *
   * Capped because a user can bounce between tabs indefinitely and this would
   * otherwise grow for the life of the process.
   * ───────────────────────────────────────────────────────────────── */
  const historyRef = useRef<ScreenState[]>([]);
  const MAX_HISTORY = 40;

  /* Enter a new section with no way back into the old one — signing in, signing
   * out, or being signed out. Leaving the trail intact after any of those would
   * let back re-open a screen the user no longer has a session for. */
  const resetTo = useCallback((target: ScreenState) => {
    historyRef.current = [];
    setScreen(target);
  }, []);

  /* Safe navigation: redirect to AUTH if trying to reach a protected screen
   * without a session. Use this everywhere instead of setScreen directly. */
  const navigateTo = useCallback((target: ScreenState) => {
    if (PROTECTED_SCREENS.has(target) && !hasSession.current) {
      resetTo('AUTH');
      return;
    }
    setScreen((current) => {
      if (current !== target) {
        historyRef.current = [...historyRef.current, current].slice(-MAX_HISTORY);
      }
      return target;
    });
  }, []);

  /** Pop one screen. Returns false when there is nothing left to pop. */
  const goBack = useCallback((): boolean => {
    const trail = historyRef.current;
    if (trail.length === 0) return false;
    const previous = trail[trail.length - 1];
    historyRef.current = trail.slice(0, -1);
    setScreen(previous);
    return true;
  }, []);

  /* Android hardware/gesture back. Returning true swallows the event; false
   * lets Android close the app. */
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => goBack());
    return () => sub.remove();
  }, [goBack]);

  /* Global 401 handler — called by apiFetch when a token is rejected.
   * Wipes the session and sends the user back to the login screen. */
  const handleUnauthorized = useCallback(() => {
    hasSession.current = false;
    setUser(null);
    removeAuthToken();
    removeUserData();
    resetTo('AUTH');
  }, [resetTo]);

  useEffect(() => {
    checkAuth();
  }, []);

  // Register the global 401 handler so any apiFetch call that gets a 401
  // (expired/invalid token) will wipe the session and return to AUTH.
  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
  }, [handleUnauthorized]);

  const checkAuth = async () => {
    try {
      const token = await getAuthToken();
      const userData = await getUserData();
      if (userData) setUser(userData);
      hasSession.current = !!token;
      if (token) {
        setScreen('HOME');
      }
    } catch (e) { }
  };

  // The splash timer resolves after checkAuth, so without this guard it would
  // overwrite the authenticated redirect and send a signed-in user back
  // through onboarding.
  const handleFinishSplash = () => {
    resetTo(hasSession.current ? 'HOME' : 'ONBOARDING');
  };

  const handleFinishOnboarding = () => {
    resetTo('AUTH');
  };

  const handleLoginSuccess = (userData: any) => {
    hasSession.current = true;
    setUser(userData);
    resetTo('HOME');
  };

  const handleLogout = async () => {
    hasSession.current = false;
    setUser(null);
    await removeAuthToken();
    await removeUserData();
    resetTo('AUTH');
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
        {/* SPLASH is full-bleed dark green — a light strip above it would
            read as a rendering glitch, so it opts out of the inset. */}
        <View style={[styles.content, screen !== 'SPLASH' && styles.inset]}>
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
              onVerified={() => navigateTo('HOME')}
            />
          )}

          {screen === 'HOME' && (
            <HomeScreen
              onNavigateToReport={(type) => {
                setReportType(type);
                navigateTo('REPORT');
              }}
              onNavigateToEmergency={() => navigateTo('EMERGENCY')}
              onNavigateToMap={() => navigateTo('MAP')}
              onNavigateToRoute={() => navigateTo('ROUTE_PREVIEW')}
              onChangeArea={() => navigateTo('AREA_PICKER')}
              onNavigateToAlerts={() => navigateTo('ROAD_ALERTS')}
              onNavigateToTips={() => navigateTo('SAFETY_TIPS')}
            />
          )}

          {screen === 'REPORT' && (
            <ReportSubmitScreen
              initialType={reportType}
              onBack={() => navigateTo('HOME')}
              onSuccess={() => navigateTo('REPORT_SUBMITTED')}
            />
          )}

          {screen === 'LOCATION_PICKER' && (
            <LocationPickerScreen
              onLocationSelected={(_name, _lat, _lng) => navigateTo('REPORT')}
              onCancel={() => navigateTo('REPORT')}
            />
          )}

          {screen === 'REPORT_SUBMITTED' && (
            <ReportSubmittedScreen
              onGoToTracking={() => navigateTo('MY_REPORTS')}
              onGoHome={() => navigateTo('HOME')}
            />
          )}

          {screen === 'MY_REPORTS' && (
            <MyReportsScreen
              onSelectReport={(report) => {
                setSelectedReport(report);
                navigateTo('REPORT_DETAILS');
              }}
              onNewReport={() => {
                setReportType('ACCIDENT');
                navigateTo('REPORT');
              }}
            />
          )}

          {screen === 'REPORT_DETAILS' && (
            <ReportDetailsScreen
              report={selectedReport}
              onBack={() => navigateTo('MY_REPORTS')}
              onOpenMap={() => navigateTo('MAP')}
            />
          )}

          {screen === 'MAP' && (
            <MapScreen
              onNavigateToReport={(type) => {
                setReportType(type);
                navigateTo('REPORT');
              }}
            />
          )}

          {screen === 'ROUTE_PREVIEW' && (
            <RoutePreviewScreen onBack={() => navigateTo('HOME')} />
          )}

          {screen === 'AREA_PICKER' && <AreaPickerScreen onDone={() => navigateTo('HOME')} />}

          {screen === 'EMERGENCY' && <EmergencyScreen onBack={() => navigateTo('HOME')} />}

          {screen === 'ROAD_ALERTS' && (
            <NotificationsScreen
              onSelectAlert={(alert) => {
                setSelectedAlert(alert);
                navigateTo('ALERT_DETAILS');
              }}
            />
          )}

          {screen === 'ALERT_DETAILS' && (
            <AlertDetailsScreen
              alert={selectedAlert}
              onBack={() => navigateTo('ROAD_ALERTS')}
              onOpenMap={() => navigateTo('MAP')}
            />
          )}

          {screen === 'SAFETY_TIPS' && (
            <SafetyTipsScreen
              onSelectTip={(tip) => {
                setSelectedTip(tip);
                navigateTo('SAFETY_TIP_DETAILS');
              }}
              onBack={() => navigateTo('HOME')}
            />
          )}

          {screen === 'SAFETY_TIP_DETAILS' && (
            <SafetyTipDetailsScreen tip={selectedTip} onBack={() => navigateTo('SAFETY_TIPS')} />
          )}

          {screen === 'NOTIFICATIONS' && (
            <NotificationsScreen
              onSelectAlert={(alert) => {
                setSelectedAlert(alert);
                navigateTo('ALERT_DETAILS');
              }}
            />
          )}

          {screen === 'PROFILE' && (
            <ProfileScreen onLogout={handleLogout} onNavigate={(target) => navigateTo(target)} />
          )}

          {screen === 'EDIT_PROFILE' && (
            <EditProfileScreen
              user={user}
              onSave={() => navigateTo('PROFILE')}
              onBack={() => navigateTo('PROFILE')}
            />
          )}

          {screen === 'CHANGE_PASSWORD' && (
            <ChangePasswordScreen onBack={() => navigateTo('PROFILE')} />
          )}

          {screen === 'SETTINGS' && <SettingsScreen onBack={() => navigateTo('PROFILE')} />}

          {screen === 'HELP_SUPPORT' && <HelpSupportScreen onBack={() => navigateTo('PROFILE')} />}

          {screen === 'ABOUT' && <AboutScreen onBack={() => navigateTo('PROFILE')} />}

          {screen === 'PRIVACY_POLICY' && <PrivacyPolicyScreen onBack={() => navigateTo('PROFILE')} />}

          {screen === 'TERMS_CONDITIONS' && (
            <TermsConditionsScreen onBack={() => navigateTo('PROFILE')} />
          )}

          {/* Quick-report FAB — only on the map */}
          {screen === 'MAP' && (
            <ReportFab
              onPress={() => {
                setReportType('ACCIDENT');
                navigateTo('REPORT');
              }}
            />
          )}
        </View>

        {TAB_SCREENS.includes(screen) && (
          <TabBar
            items={TAB_ITEMS}
            activeKey={activeTabKey}
            onSelect={(key) => navigateTo(key as ScreenState)}
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
  inset: {
    paddingTop: TOP_INSET,
  },
});
