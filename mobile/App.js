import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <WebView 
        source={{ uri: 'https://brosdrop.com' }} 
        style={styles.webview}
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled
        // Enable file uploads on Android
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b', // Match dark theme background
    paddingTop: Platform.OS === 'android' ? 35 : 0, // Simple status bar handling
  },
  webview: {
    flex: 1,
    backgroundColor: '#09090b',
  },
});
