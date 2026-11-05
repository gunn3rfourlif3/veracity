import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { c } from './theme';
import { H1, Body, PrimaryButton, SourceRow } from './ui';
import { runScan, ScanResult } from './pipeline';

type Props = { onResult: (r: ScanResult, uri: string) => void };

export default function ScanScreen({ onResult }: Props) {
  const [uri, setUri] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function pick(from: 'library' | 'camera') {
    try {
      if (from === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Camera access needed', 'Veracity needs the camera to capture a screen in front of you.');
          return;
        }
        const r = await ImagePicker.launchCameraAsync({ quality: 0.9 });
        if (!r.canceled) setUri(r.assets[0].uri);
        return;
      }
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
      if (!r.canceled) setUri(r.assets[0].uri);
    } catch (e: any) {
      Alert.alert('Could not open that', String(e?.message ?? e));
    }
  }

  async function check() {
    if (!uri) {
      Alert.alert('Add a photo first', 'Pick a screenshot, or take a photo of a screen.');
      return;
    }
    setBusy(true);
    try {
      const result = await runScan(uri);
      onResult(result, uri);
    } catch (e: any) {
      Alert.alert('Scan failed', String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.wordmark}>Veracity</Text>
      </View>

      <View style={s.middle}>
        <H1>Who are you{'\n'}checking?</H1>
        <Body style={{ marginTop: 13 }}>
          One photo is enough to start. It never leaves your phone as an image — only as an
          anonymous fingerprint.
        </Body>

        <Pressable
          accessibilityRole="button"
          onPress={() => pick('library')}
          style={({ pressed }) => [s.drop, pressed && { opacity: 0.72 }]}
        >
          <View style={s.dropIcon} />
          <Text style={s.dropTitle}>{uri ? 'Photo added' : 'Add a screenshot'}</Text>
          <Text style={s.dropSub}>
            {uri ? 'Tap to choose a different one' : 'Share from any app, or tap to browse'}
          </Text>
        </Pressable>

        <View style={{ marginTop: 12, gap: 10 }}>
          <SourceRow
            title="Paste a profile link"
            detail="Instagram, a dating profile, anything public"
            onPress={() =>
              Alert.alert('Not wired up yet', 'Link intake needs the backend. Use a screenshot for now.')
            }
          />
          <SourceRow
            title="Take a photo"
            detail="Of a screen in front of you"
            onPress={() => pick('camera')}
          />
        </View>
      </View>

      <View style={{ paddingHorizontal: 24 }}>
        {busy ? (
          <View style={s.busy}>
            <ActivityIndicator color={c.inkInv} />
            <Text style={s.busyLabel}>Running checks…</Text>
          </View>
        ) : (
          <PrimaryButton label="Check this person" onPress={check} />
        )}
      </View>

      <Text style={s.footer}>Nothing is stored. What we keep and for how long</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 0 },
  wordmark: { fontFamily: 'serif', fontSize: 24, color: c.ink, letterSpacing: -0.2 },
  middle: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  drop: {
    marginTop: 24,
    minHeight: 162,
    borderRadius: 16,
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.borderDash,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dropIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: c.accentBg },
  dropTitle: { fontSize: 16, fontWeight: '600', color: c.ink },
  dropSub: { fontSize: 13, color: c.muted },
  busy: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: c.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  busyLabel: { color: c.inkInv, fontSize: 16, fontWeight: '600' },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    color: c.muted,
    marginTop: 14,
    marginBottom: 28,
    marginHorizontal: 28,
  },
});
