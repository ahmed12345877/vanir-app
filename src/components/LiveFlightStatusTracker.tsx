import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  G,
} from 'react-native-svg';
import {
  Plane,
  Search,
  Radio,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Clock,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import {
  fetchLiveFlightStatus,
  LiveRadarFlight,
} from '../services/flightTrackerApi';

export interface LiveFlightStatusTrackerProps {
  initialFlightNumber?: string;
  onSelectFlight?: (flight: LiveRadarFlight) => void;
  style?: any;
}

const POPULAR_FLIGHT_CHIPS = ['EK 902', 'EK 924', 'QR 1302', 'SV 312', 'BA 108', 'VN 88'];

export function LiveFlightStatusTracker({
  initialFlightNumber = 'EK902',
  onSelectFlight,
  style,
}: LiveFlightStatusTrackerProps) {
  const [flightInput, setFlightInput] = useState(initialFlightNumber);
  const [activeFlightNumber, setActiveFlightNumber] = useState(initialFlightNumber);

  // Flight Data State
  const [flightData, setFlightData] = useState<LiveRadarFlight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Animation values for airplane flight along curved arc
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarSpinAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for status badges & radar dots
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    const spinLoop = Animated.loop(
      Animated.timing(radarSpinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinLoop.start();

    return () => {
      pulseLoop.stop();
      spinLoop.stop();
    };
  }, [pulseAnim, radarSpinAnim]);

  // Query Live Tracking API Handshake
  const queryFlightStatus = async (flightNum: string, isBackground = false) => {
    if (!isBackground) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setErrorMessage(null);

    try {
      const data = await fetchLiveFlightStatus(flightNum);
      setFlightData(data);
      setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Smoothly animate airplane position along bezier curve
      Animated.timing(progressAnim, {
        toValue: (data.progressPercent || 0) / 100,
        duration: isBackground ? 1400 : 1800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      if (onSelectFlight) {
        onSelectFlight(data);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Flight record is currently securing radar clearance. Please verify your flight number or check back shortly.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial query & background auto-refresh every 15 seconds without reloading full page
  useEffect(() => {
    queryFlightStatus(activeFlightNumber, false);

    const interval = setInterval(() => {
      queryFlightStatus(activeFlightNumber, true);
    }, 15000);

    return () => clearInterval(interval);
  }, [activeFlightNumber]);

  const handleSearchSubmit = () => {
    const clean = flightInput.trim();
    if (clean) {
      setActiveFlightNumber(clean);
    }
  };

  // Status Badge Colors & Visuals
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'boarding':
        return {
          label: 'BOARDING',
          bgColor: 'rgba(245, 158, 11, 0.12)',
          borderColor: '#F59E0B',
          dotColor: '#F59E0B',
          textColor: '#D97706',
        };
      case 'delayed':
        return {
          label: 'DELAYED',
          bgColor: 'rgba(153, 27, 27, 0.15)',
          borderColor: '#991B1B',
          dotColor: '#DC2626',
          textColor: '#EF4444',
        };
      case 'active':
      case 'on_time':
      default:
        return {
          label: 'ON TIME',
          bgColor: 'rgba(16, 185, 129, 0.12)',
          borderColor: '#10B981',
          dotColor: '#10B981',
          textColor: '#059669',
        };
    }
  };

  const statusVisual = getStatusBadge(flightData?.status);

  // Compute curved flight path position:
  // Bezier curve: P0 = (36, 52), P1 = (160, 10), P2 = (284, 52)
  const currentProgress = flightData?.progressPercent ? flightData.progressPercent / 100 : 0.68;
  const p0x = 36;
  const p0y = 52;
  const p1x = 160;
  const p1y = 10;
  const p2x = 284;
  const p2y = 52;

  const t = Math.max(0.04, Math.min(0.96, currentProgress));
  const planeX = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * p1x + t * t * p2x;
  const planeY = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * p1y + t * t * p2y;

  // Tangent angle
  const dx = 2 * (1 - t) * (p1x - p0x) + 2 * t * (p2x - p1x);
  const dy = 2 * (1 - t) * (p1y - p0y) + 2 * t * (p2y - p1y);
  const planeAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <View style={[styles.container, style]}>
      {/* Live Radar Header & Flight Search Bar */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleCol}>
          <View style={styles.radarLiveBadge}>
            <Animated.View style={[styles.radarLiveDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.radarLiveText}>LIVE RADAR TELEMETRY</Text>
          </View>
          <Text style={styles.mainTitle}>Flight Status Tracker</Text>
        </View>

        <Pressable
          style={styles.refreshBtn}
          onPress={() => queryFlightStatus(activeFlightNumber, true)}
          disabled={isRefreshing || isLoading}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#D4AF37" />
          ) : (
            <RefreshCw size={15} color="#D4AF37" strokeWidth={2.4} />
          )}
        </Pressable>
      </View>

      {/* Flight Search Input Box */}
      <View style={styles.searchBarContainer}>
        <Search size={16} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Flight Number (e.g. EK902, QR1302)..."
          placeholderTextColor="#64748B"
          value={flightInput}
          onChangeText={setFlightInput}
          onSubmitEditing={handleSearchSubmit}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Pressable style={styles.trackBtn} onPress={handleSearchSubmit}>
          <Text style={styles.trackBtnText}>TRACK</Text>
        </Pressable>
      </View>

      {/* Quick Select Chips */}
      <View style={styles.chipsRow}>
        <Text style={styles.chipsLabel}>Active VIP Flights:</Text>
        {POPULAR_FLIGHT_CHIPS.map(num => (
          <Pressable
            key={num}
            style={[styles.chipPill, activeFlightNumber === num.replace(/\s+/g, '') && styles.chipPillActive]}
            onPress={() => {
              const clean = num.replace(/\s+/g, '');
              setFlightInput(clean);
              setActiveFlightNumber(clean);
            }}
          >
            <Text
              style={[
                styles.chipText,
                activeFlightNumber === num.replace(/\s+/g, '') && styles.chipTextActive,
              ]}
            >
              {num}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Establishing Radar Handshake…</Text>
          <Text style={styles.loadingSub}>Connecting to Aviationstack & GDS radar systems</Text>
        </View>
      ) : errorMessage ? (
        /* Requirement 5: Luxury Error Boundary Screen */
        <View style={styles.errorCard}>
          <View style={styles.errorIconCircle}>
            <Compass color="#D4AF37" size={32} strokeWidth={1.8} />
          </View>
          <Text style={styles.errorTitle}>Radar Telemetry Pending</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <View style={styles.errorActionsRow}>
            <Pressable
              style={styles.errorRetryBtn}
              onPress={() => queryFlightStatus(activeFlightNumber, false)}
            >
              <RefreshCw color="#1C1917" size={14} strokeWidth={2.4} />
              <Text style={styles.errorRetryText}>Re-Query Radar</Text>
            </Pressable>
            <Pressable
              style={styles.errorPresetBtn}
              onPress={() => {
                setFlightInput('EK902');
                setActiveFlightNumber('EK902');
              }}
            >
              <Text style={styles.errorPresetText}>Track EK902 (Emirates A380)</Text>
            </Pressable>
          </View>
        </View>
      ) : flightData ? (
        <View style={styles.radarCard}>
          {/* Top Flight Info & Status Badge (Requirement 3) */}
          <View style={styles.flightTopBar}>
            <View>
              <Text style={styles.airlineNameText}>
                {flightData.airlineCountry} {flightData.airline}
              </Text>
              <View style={styles.flightNumberSubRow}>
                <Text style={styles.flightNumberBadgeText}>{flightData.flightNumber}</Text>
                <Text style={styles.aircraftModelText}>• {flightData.aircraft}</Text>
              </View>
            </View>

            {/* Requirement 3: Sophisticated Status Badge with Glowing Indicator Dot */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusVisual.bgColor,
                  borderColor: statusVisual.borderColor,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.statusPulseDot,
                  {
                    backgroundColor: statusVisual.dotColor,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              />
              <Text style={[styles.statusBadgeLabel, { color: statusVisual.textColor }]}>
                {statusVisual.label}
              </Text>
            </View>
          </View>

          {/* ========================================================================= */}
          {/* Requirement 2: Premium Curved Vector Path with Animated Airplane */}
          {/* ========================================================================= */}
          <View style={styles.visualProgressSection}>
            {/* Origin & Destination Labels Above Arc */}
            <View style={styles.arcHeaderRow}>
              <View>
                <Text style={styles.arcIataBig}>{flightData.departure.iata}</Text>
                <Text style={styles.arcCityName}>{flightData.departure.city}</Text>
              </View>
              <View style={styles.arcCenterTelemetry}>
                <Text style={styles.telemetryRemainingText}>{flightData.remainingTime} remaining</Text>
                <Text style={styles.telemetryStatusSub}>{flightData.statusLabel}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.arcIataBig}>{flightData.arrival.iata}</Text>
                <Text style={styles.arcCityName}>{flightData.arrival.city}</Text>
              </View>
            </View>

            {/* Curved Arc Vector Container */}
            <View style={styles.svgWrapper}>
              <Svg width={320} height={70} viewBox="0 0 320 70">
                <Defs>
                  <SvgGradient id="pathGoldGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                    <Stop offset="50%" stopColor="#D4AF37" stopOpacity="0.9" />
                    <Stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
                  </SvgGradient>
                </Defs>

                {/* Base Curved Arc Path */}
                <Path
                  d="M 36,52 Q 160,10 284,52"
                  fill="none"
                  stroke="rgba(212, 175, 55, 0.25)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />

                {/* Traveled Gold Solid Path (Approximate portion) */}
                <Path
                  d={`M 36,52 Q ${(160 * currentProgress).toFixed(1)},${(52 - (52 - 10) * currentProgress).toFixed(1)} ${planeX.toFixed(1)},${planeY.toFixed(1)}`}
                  fill="none"
                  stroke="url(#pathGoldGrad)"
                  strokeWidth="3"
                />

                {/* Origin Anchor Circle */}
                <Circle cx={36} cy={52} r={6} fill="#1C1917" stroke="#D4AF37" strokeWidth="2" />
                <Circle cx={36} cy={52} r={2.5} fill="#D4AF37" />

                {/* Destination Anchor Circle */}
                <Circle cx={284} cy={52} r={6} fill="#1C1917" stroke="#D4AF37" strokeWidth="2" />
                <Circle cx={284} cy={52} r={2.5} fill="#D4AF37" />

                {/* Animated Custom Airplane Marker along Path */}
                <G
                  transform={`translate(${planeX - 12}, ${planeY - 12}) rotate(${planeAngle}, 12, 12)`}
                >
                  <Circle cx={12} cy={12} r={14} fill="#D4AF37" fillOpacity="0.2" />
                  <Circle cx={12} cy={12} r={9} fill="#1C1917" stroke="#D4AF37" strokeWidth="1.5" />
                  {/* Minimal Airplane Vector Icon */}
                  <Path
                    d="M 12,5 L 14,10 L 19,12 L 14,14 L 14,18 L 12,17 L 10,18 L 10,14 L 5,12 L 10,10 Z"
                    fill="#D4AF37"
                  />
                </G>
              </Svg>
            </View>

            {/* Radar Telemetry Pills (Speed, Altitude, Progress) */}
            <View style={styles.telemetryPillsRow}>
              <View style={styles.telemetryPill}>
                <Text style={styles.telemetryPillLabel}>ALTITUDE</Text>
                <Text style={styles.telemetryPillValue}>{flightData.altitude}</Text>
              </View>
              <View style={styles.telemetryPill}>
                <Text style={styles.telemetryPillLabel}>GROUND SPEED</Text>
                <Text style={styles.telemetryPillValue}>{flightData.speed}</Text>
              </View>
              <View style={styles.telemetryPill}>
                <Text style={styles.telemetryPillLabel}>FLIGHT PROGRESS</Text>
                <Text style={styles.telemetryPillValue}>{flightData.progressPercent}%</Text>
              </View>
            </View>
          </View>

          {/* ========================================================================= */}
          {/* Requirement 4: Airport Detail Grid in Minimalist 4-Column Layout */}
          {/* ========================================================================= */}
          <View style={styles.detailGridContainer}>
            {/* Departure 4-Column Row */}
            <View style={styles.gridSectionHeader}>
              <View style={styles.gridSectionDot} />
              <Text style={styles.gridSectionTitle}>
                DEPARTURE • {flightData.departure.iata} ({flightData.departure.airport})
              </Text>
            </View>
            <View style={styles.fourColGrid}>
              <View style={styles.colCell}>
                <Text style={styles.cellLabel}>TERMINAL</Text>
                <Text style={styles.cellValue}>{flightData.departure.terminal}</Text>
              </View>
              <View style={styles.cellDivider} />
              <View style={styles.colCell}>
                <Text style={styles.cellLabel}>GATE</Text>
                <Text style={styles.cellValue}>{flightData.departure.gate}</Text>
              </View>
              <View style={styles.cellDivider} />
              <View style={styles.colCell}>
                <Text style={styles.cellLabel}>SCHED DEP</Text>
                <Text style={styles.cellValue}>{flightData.departure.scheduledTime}</Text>
              </View>
              <View style={styles.cellDivider} />
              <View style={styles.colCell}>
                <Text style={styles.cellLabel}>ACTUAL DEP</Text>
                <Text style={[styles.cellValue, styles.cellValueHighlight]}>
                  {flightData.departure.actualTime}
                </Text>
              </View>
            </View>

            {/* Horizontal Micro Line */}
            <View style={styles.horizontalMicroLine} />

            {/* Arrival 4-Column Row */}
            <View style={[styles.gridSectionHeader, { marginTop: 12 }]}>
              <View style={[styles.gridSectionDot, { backgroundColor: '#D4AF37' }]} />
              <Text style={styles.gridSectionTitle}>
                ARRIVAL • {flightData.arrival.iata} ({flightData.arrival.airport})
              </Text>
            </View>
            <View style={styles.fourColGrid}>
              <View style={styles.colCell}>
                <Text style={styles.cellLabel}>TERMINAL</Text>
                <Text style={styles.cellValue}>{flightData.arrival.terminal}</Text>
              </View>
              <View style={styles.cellDivider} />
              <View style={styles.colCell}>
                <Text style={styles.cellLabel}>GATE</Text>
                <Text style={styles.cellValue}>{flightData.arrival.gate}</Text>
              </View>
              <View style={styles.cellDivider} />
              <View style={styles.colCell}>
                <Text style={styles.cellLabel}>SCHED ARR</Text>
                <Text style={styles.cellValue}>{flightData.arrival.scheduledTime}</Text>
              </View>
              <View style={styles.cellDivider} />
              <View style={styles.colCell}>
                <Text style={styles.cellLabel}>EST ARR</Text>
                <Text style={[styles.cellValue, styles.cellValueHighlight]}>
                  {flightData.arrival.actualTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Live Background Sync Footer (Requirement 1) */}
          <View style={styles.radarFooterRow}>
            <Radio color="#22C55E" size={12} />
            <Text style={styles.radarFooterText}>
              Aviationstack Radar Synced • Background Refresh Active ({lastSyncTime})
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1917',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    padding: 18,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleCol: {
    gap: 3,
  },
  radarLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radarLiveDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  radarLiveText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 1.2,
  },
  mainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    paddingLeft: 12,
    paddingRight: 6,
    height: 44,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  trackBtn: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  trackBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1C1917',
    letterSpacing: 0.8,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  chipsLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  chipPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  chipPillActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  chipTextActive: {
    color: '#D4AF37',
    fontWeight: '800',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 6,
  },
  loadingSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  // Error Boundary (Requirement 5)
  errorCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    padding: 20,
    alignItems: 'center',
  },
  errorIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  errorMessage: {
    fontSize: 12.5,
    color: '#CBD5E1',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorActionsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  errorRetryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    borderRadius: 10,
  },
  errorRetryText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  errorPresetBtn: {
    flex: 1.3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingVertical: 10,
    borderRadius: 10,
  },
  errorPresetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Radar Card
  radarCard: {
    gap: 14,
  },
  flightTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  airlineNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  flightNumberSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  flightNumberBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  aircraftModelText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeLabel: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  // Curved Vector Arc
  visualProgressSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 14,
  },
  arcHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arcIataBig: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  arcCityName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 1,
  },
  arcCenterTelemetry: {
    alignItems: 'center',
  },
  telemetryRemainingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.3,
  },
  telemetryStatusSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 1,
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  telemetryPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  telemetryPill: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  telemetryPillLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  telemetryPillValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  // 4-Column Detail Grid (Requirement 4)
  detailGridContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    padding: 12,
  },
  gridSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  gridSectionDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  gridSectionTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 0.8,
  },
  fourColGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  colCell: {
    flex: 1,
    alignItems: 'center',
  },
  cellLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  cellValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  cellValueHighlight: {
    color: '#D4AF37',
  },
  cellDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  horizontalMicroLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 8,
  },
  radarFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
    opacity: 0.85,
  },
  radarFooterText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
