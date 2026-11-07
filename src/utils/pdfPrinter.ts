import { Alert, NativeModules, Platform } from 'react-native';
import type { WebView } from 'react-native-webview';

interface VanirPrintNativeModule {
  printHtml(html: string, jobName?: string): Promise<boolean>;
}

const VanirPrint: VanirPrintNativeModule | undefined = NativeModules.VanirPrint;

/**
 * Triggers native A4 color PDF Save / Print dialog on Android via PrintManager,
 * with iOS WebView window.print() fallback.
 */
export async function printOrSavePdfDocument(options: {
  html: string;
  jobName: string;
  webViewRef?: React.RefObject<WebView | null>;
}): Promise<boolean> {
  const { html, jobName, webViewRef } = options;

  if (Platform.OS === 'android' && VanirPrint && typeof VanirPrint.printHtml === 'function') {
    try {
      await VanirPrint.printHtml(html, jobName);
      return true;
    } catch (err: any) {
      Alert.alert(
        'PDF Export Notice',
        err?.message || 'Unable to launch Android PDF Print Spooler right now.',
      );
      return false;
    }
  }

  if (webViewRef?.current) {
    webViewRef.current.injectJavaScript('window.print(); true;');
    return true;
  }

  Alert.alert(
    'Save Official PDF',
    'PDF print spooler is initializing. Please try again in a moment.',
  );
  return false;
}
