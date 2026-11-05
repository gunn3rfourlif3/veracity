import React from 'react';
import { StatusBar as RNStatusBar, View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { c } from './src/theme';
import ScanScreen from './src/ScanScreen';
import ResultScreen from './src/ResultScreen';
import VerifyScreen from './src/VerifyScreen';
import { ScanResult } from './src/pipeline';

type Route = 'scan' | 'result' | 'verify';

// Top inset without react-native-safe-area-context: that package ships a Fabric
// component spec, and its C++ codegen output blew past Windows' 260-char MAX_PATH.
// See CLAUDE.md. Android reports the status bar height directly; iOS needs a
// constant, and 44 covers notched devices.
const TOP_INSET =
  Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 24 : 44;

export default function App() {
  const [route, setRoute] = React.useState<Route>('scan');
  const [result, setResult] = React.useState<ScanResult | null>(null);

  return (
    <View style={[styles.root, { paddingTop: TOP_INSET }]}>
      <StatusBar style="dark" />
      {route === 'scan' && (
        <ScanScreen
          onResult={(r) => {
            setResult(r);
            setRoute('result');
          }}
        />
      )}
      {route === 'result' && result && (
        <ResultScreen
          result={result}
          onBack={() => setRoute('scan')}
          onRescan={() => setRoute('scan')}
          onVerify={() => setRoute('verify')}
        />
      )}
      {route === 'verify' && <VerifyScreen onBack={() => setRoute('result')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
});
