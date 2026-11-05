import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { c } from './src/theme';
import ScanScreen from './src/ScanScreen';
import ResultScreen from './src/ResultScreen';
import VerifyScreen from './src/VerifyScreen';
import { ScanResult } from './src/pipeline';

type Route = 'scan' | 'result' | 'verify';

export default function App() {
  const [route, setRoute] = React.useState<Route>('scan');
  const [result, setResult] = React.useState<ScanResult | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
});
