import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MapPin, Maximize2, X, ExternalLink, Compass } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LuxuryPressable } from './LuxuryMicroInteractions';

interface HotelMapViewProps {
  hotelName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  height?: number;
}

// Default fallback coordinates (e.g. Dubai Creek / Nile Ritz)
const DEFAULT_COORDS = {
  latitude: 25.2638,
  longitude: 55.3093,
};

export function HotelMapView({
  hotelName,
  address,
  latitude = DEFAULT_COORDS.latitude,
  longitude = DEFAULT_COORDS.longitude,
  height = 200,
}: HotelMapViewProps) {
  const insets = useSafeAreaInsets();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Generate modern HTML map using Leaflet with clean CartoDB Voyager / OSM tiles
  const leafletHtml = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; background: #E5E7EB; }
          .custom-pin {
            width: 32px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          .custom-pin svg {
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35));
          }
          .leaflet-popup-content-wrapper {
            background: #1C1917;
            color: #FFFFFF;
            border-radius: 12px;
            padding: 4px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .leaflet-popup-tip { background: #1C1917; }
          .hotel-popup-title {
            font-size: 13px;
            font-weight: 800;
            color: #D4AF37;
            margin-bottom: 2px;
          }
          .hotel-popup-sub {
            font-size: 11px;
            color: #E2E8F0;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const lat = ${latitude};
          const lng = ${longitude};
          const map = L.map('map', {
            center: [lat, lng],
            zoom: 15,
            zoomControl: false,
            attributionControl: false
          });

          // Crisp clean CartoDB Voyager luxury map tiles
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
          }).addTo(map);

          // Custom Red Hotel Pin Marker matching Google Maps style
          const pinHtml = \`
            <div class="custom-pin">
              <svg width="34" height="44" viewBox="0 0 24 32" fill="none">
                <path d="M12 0C5.372 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.372-12-12-12z" fill="#DC2626"/>
                <circle cx="12" cy="11" r="5" fill="#FFFFFF"/>
                <circle cx="12" cy="11" r="3" fill="#B91C1C"/>
              </svg>
            </div>
          \`;

          const pinIcon = L.divIcon({
            html: pinHtml,
            className: '',
            iconSize: [34, 44],
            iconAnchor: [17, 44],
            popupAnchor: [0, -42]
          });

          const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
          marker.bindPopup(\`
            <div>
              <div class="hotel-popup-title">${hotelName.replace(/'/g, "\\'")}</div>
              <div class="hotel-popup-sub">${address.replace(/'/g, "\\'")}</div>
            </div>
          \`).openPopup();
        </script>
      </body>
      </html>
    `;
  }, [latitude, longitude, hotelName, address]);

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(`${hotelName}, ${address}`);
    const nativeUrl = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    if (nativeUrl) {
      Linking.canOpenURL(nativeUrl)
        .then(supported => {
          if (supported) {
            Linking.openURL(nativeUrl);
          } else {
            Linking.openURL(webUrl);
          }
        })
        .catch(() => Linking.openURL(webUrl));
    } else {
      Linking.openURL(webUrl);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Card */}
      <View style={[styles.mapCard, { height }]}>
        <WebView
          source={{ html: leafletHtml }}
          style={styles.webView}
          scrollEnabled={false}
          javaScriptEnabled
          domStorageEnabled
          onLoadEnd={() => setMapLoaded(true)}
        />

        {!mapLoaded && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#D4AF37" />
          </View>
        )}

        {/* Expand Fullscreen Button on Top Right */}
        <LuxuryPressable
          style={styles.expandButton}
          onPress={() => setIsFullscreen(true)}
          accessibilityLabel="Expand Map"
        >
          <Maximize2 color="#1C1917" size={17} strokeWidth={2.4} />
        </LuxuryPressable>
      </View>

      {/* View on Google Maps Link Button */}
      <Pressable style={styles.googleMapsLink} onPress={handleOpenGoogleMaps}>
        <MapPin color="#D4AF37" size={15} strokeWidth={2.2} />
        <Text style={styles.googleMapsText}>View on Google Maps</Text>
        <ExternalLink color="#D4AF37" size={13} strokeWidth={2} style={{ marginLeft: 2 }} />
      </Pressable>

      {/* Fullscreen Map Modal */}
      <Modal
        visible={isFullscreen}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullscreenModal}>
          <WebView
            source={{ html: leafletHtml }}
            style={styles.fullscreenWebView}
            javaScriptEnabled
            domStorageEnabled
          />

          {/* Top Floating Header */}
          <View style={[styles.fullscreenHeader, { paddingTop: Math.max(insets.top, 16) }]}>
            <LuxuryPressable
              style={styles.closeBtn}
              onPress={() => setIsFullscreen(false)}
            >
              <X color="#1C1917" size={20} strokeWidth={2.5} />
            </LuxuryPressable>

            <View style={styles.headerInfoPill}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {hotelName}
              </Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {address}
              </Text>
            </View>

            <LuxuryPressable
              style={styles.closeBtn}
              onPress={handleOpenGoogleMaps}
            >
              <ExternalLink color="#1C1917" size={18} strokeWidth={2.2} />
            </LuxuryPressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  mapCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  googleMapsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 4,
    gap: 6,
  },
  googleMapsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  fullscreenWebView: {
    flex: 1,
  },
  fullscreenHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerInfoPill: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
});
