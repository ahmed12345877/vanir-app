
import React, { useMemo } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Search, LayoutGrid, User, Compass, Plane } from 'lucide-react-native';
import {
  NavHomeIcon,
  NavMapIcon,
  NavGridIcon,
  NavProfileIcon,
  NavMessagesIcon,
  NAV_GOLD,
} from '../components/LuxuryNavIcons';
import { AnimatedSpectralLine } from '../components/AnimatedSpectralLine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import type { MainTabParamList, RootStackParamList } from './types';

// Screens
import { HomeScreen } from '../screens/main/HomeScreen';
import { InteractiveMapScreen } from '../screens/main/InteractiveMapScreen';
import { MessagesScreen } from '../screens/main/MessagesScreen';
import { FlightSearchScreen } from '../screens/tabs/FlightSearchScreen';
import { ServicesScreen } from '../screens/main/ServicesScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { BookingScreen } from '../screens/main/BookingScreen';
import { AIStudioScreen } from '../screens/main/AIStudioScreen';
import { SearchResultsScreen } from '../screens/main/SearchResultsScreen';
import { ServiceBookingScreen } from '../screens/services/ServiceBookingScreen';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { OfficesScreen } from '../screens/main/OfficesScreen';
import { CustomerSupportScreen } from '../screens/main/CustomerSupportScreen';
import { UserProfileScreen } from '../screens/main/UserProfileScreen';
import { AboutScreen } from '../screens/main/AboutScreen';
import { DestinationsScreen } from '../screens/main/DestinationsScreen';
import { OffersScreen } from '../screens/main/OffersScreen';
import { BlogScreen } from '../screens/main/BlogScreen';
import { BlogPostScreen } from '../screens/main/BlogPostScreen';
import { PrivacyPolicyScreen } from '../screens/main/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../screens/main/TermsOfServiceScreen';
import { LegalInfoScreen } from '../screens/main/LegalInfoScreen';
import { ReviewsScreen } from '../screens/main/ReviewsScreen';
import { GalleryScreen } from '../screens/main/GalleryScreen';
import { PrivateJetScreen } from '../screens/services/PrivateJetScreen';
import { HotelBookingScreen } from '../screens/services/HotelBookingScreen';
import { HotelDetailsScreen } from '../screens/services/HotelDetailsScreen';
import { JetDetailsScreen } from '../screens/services/JetDetailsScreen';
import { YachtDetailsScreen } from '../screens/services/YachtDetailsScreen';
import { CarDetailsScreen } from '../screens/services/CarDetailsScreen';
import { HotelApartmentsScreen } from '../screens/services/HotelApartmentsScreen';
import { HotelSearchScreen } from '../screens/services/HotelSearchScreen';
import { YachtScreen } from '../screens/services/YachtScreen';
import { CarsScreen } from '../screens/services/CarsScreen';
import { LimousineScreen } from '../screens/services/LimousineScreen';
import { ESIMScreen } from '../screens/services/ESIMScreen';
import { VisaScreen } from '../screens/services/VisaScreen';
import { AirportScreen } from '../screens/services/AirportScreen';
import { ToursScreen } from '../screens/services/ToursScreen';
import { AIConciergeScreen } from '../screens/services/AIConciergeScreen';
import { PrivateJetCatalogScreen } from '../screens/services/PrivateJetCatalogScreen';
import { HotelCatalogScreen } from '../screens/services/HotelCatalogScreen';
import { FlightCatalogScreen } from '../screens/services/FlightCatalogScreen';
import { FlightBookingScreen } from '../screens/services/FlightBookingScreen';
import { YachtCatalogScreen } from '../screens/services/YachtCatalogScreen';
import { LimousineCatalogScreen } from '../screens/services/LimousineCatalogScreen';
import { ESIMCatalogScreen } from '../screens/services/ESIMCatalogScreen';
import { VisaCatalogScreen } from '../screens/services/VisaCatalogScreen';
import { AirportCatalogScreen } from '../screens/services/AirportCatalogScreen';
import { TravelPreferencesScreen } from '../screens/dashboard/TravelPreferencesScreen';
import { PaymentMethodsScreen } from '../screens/dashboard/PaymentMethodsScreen';
import { NotificationsScreen as DashboardNotificationsScreen } from '../screens/dashboard/NotificationsScreen';
import { PrivacySecurityScreen } from '../screens/dashboard/PrivacySecurityScreen';
import { TravelPlanScreen } from '../screens/services/TravelPlanScreen';
import { FlightDetailsScreen } from '../screens/services/FlightDetailsScreen';
import { SeatSelectionScreen } from '../screens/services/SeatSelectionScreen';
import { PassengerInfoScreen } from '../screens/services/PassengerInfoScreen';
import { FlightPaymentScreen } from '../screens/services/FlightPaymentScreen';
import { BoardingPassScreen } from '../screens/services/BoardingPassScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom > 0 ? insets.bottom + 6 : 12,
          left: 14,
          right: 14,
          height: 66,
          borderRadius: 22,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: 'rgba(212, 175, 55, 0.35)',
          elevation: 14,
          shadowColor: '#0D1626',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.14,
          shadowRadius: 16,
          paddingHorizontal: 8,
          paddingTop: 4,
          alignItems: 'center',
          justifyContent: 'space-around',
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <AnimatedSpectralLine
              height={3.5}
              style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
            />
          </View>
        ),
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Profile') {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 54 }}>
                {focused && (
                  <View style={{ width: 28, height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                    <AnimatedSpectralLine height={3} />
                  </View>
                )}
                <View
                  style={{
                    width: focused ? 38 : 34,
                    height: focused ? 38 : 34,
                    borderRadius: focused ? 19 : 17,
                    overflow: 'hidden',
                    borderWidth: focused ? 2 : 1.2,
                    borderColor: focused ? '#D4AF37' : 'rgba(212, 175, 55, 0.4)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    source={require('../assets/images/egyptian_royal_queen.jpg')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              </View>
            );
          }

          let IconComponent = NavHomeIcon;
          if (route.name === 'Explore') IconComponent = NavHomeIcon;
          else if (route.name === 'Discover') IconComponent = NavMapIcon;
          else if (route.name === 'Messages') IconComponent = NavMessagesIcon;
          else if (route.name === 'Services') IconComponent = NavGridIcon;

          if (focused) {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: 54 }}>
                <View style={{ width: 28, height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: 3 }}>
                  <AnimatedSpectralLine height={3} />
                </View>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    backgroundColor: '#0D1626',
                    borderWidth: 1.4,
                    borderColor: NAV_GOLD,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: NAV_GOLD,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.35,
                    shadowRadius: 5,
                    elevation: 3,
                  }}
                >
                  <IconComponent color={NAV_GOLD} size={21} strokeWidth={1.8} />
                </View>
              </View>
            );
          }

          return (
            <View style={{ width: 44, height: 54, alignItems: 'center', justifyContent: 'center' }}>
              <IconComponent color="rgba(197, 160, 89, 0.65)" size={22} strokeWidth={1.6} />
            </View>
          );
        },
      })}>
      <Tab.Screen name="Explore" component={HomeScreen} />
      <Tab.Screen name="Discover" component={InteractiveMapScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppLoadingScreen() {
  const { colors } = useTheme();

  const loadingStyles = useMemo(
    () => ({
      container: {
        flex: 1,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: colors.background,
        gap: 8,
      },
      brand: {
        fontSize: 42,
        fontWeight: '700' as const,
        color: colors.primary,
        letterSpacing: 12,
        fontFamily: 'Georgia',
      },
      text: {
        color: colors.textMuted,
        fontSize: 13,
        letterSpacing: 1.5,
        marginTop: 8,
      },
      spinner: {
        marginTop: 24,
      },
    }),
    [colors],
  );

  return (
    <View style={loadingStyles.container}>
      <Text style={loadingStyles.brand}>VANIR</Text>
      <ActivityIndicator color={colors.primary} size="large" style={loadingStyles.spinner} />
      <Text style={loadingStyles.text}>Preparing your experience…</Text>
    </View>
  );
}

export function RootNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="JetDetails" component={JetDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivateJetDetails" component={JetDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="YachtDetails" component={YachtDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CarDetails" component={CarDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LimousineDetails" component={CarDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FlightBooking" component={FlightBookingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HotelApartments" component={HotelApartmentsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Discover" component={InteractiveMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cars" component={CarsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AIStudio" component={AIStudioScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ServiceBooking" component={ServiceBookingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TravelPreferences" component={TravelPreferencesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DashboardNotifications" component={DashboardNotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerSupport" component={CustomerSupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Offices" component={OfficesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Gallery" component={GalleryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Destinations" component={DestinationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Offers" component={OffersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Blog" component={BlogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BlogPost" component={BlogPostScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LegalInfo" component={LegalInfoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivateJet" component={PrivateJetScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HotelBooking" component={HotelBookingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HotelSearch" component={HotelSearchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Yacht" component={YachtScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Limousine" component={CarsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ESIM" component={ESIMScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Visa" component={VisaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Airport" component={AirportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tours" component={ToursScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AIConcierge" component={AIConciergeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivateJetCatalog" component={PrivateJetCatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HotelCatalog" component={HotelCatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FlightCatalog" component={FlightCatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="YachtCatalog" component={YachtCatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LimousineCatalog" component={LimousineCatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ESIMCatalog" component={ESIMCatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VisaCatalog" component={VisaCatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AirportCatalog" component={AirportCatalogScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TravelPlan" component={TravelPlanScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FlightDetails" component={FlightDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SeatSelection" component={SeatSelectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PassengerDetails" component={PassengerInfoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FlightPayment" component={FlightPaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BoardingPass" component={BoardingPassScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
