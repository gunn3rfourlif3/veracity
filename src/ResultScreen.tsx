import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { c } from './theme';
import { Eyebrow, PrimaryButton, SecondaryButton } from './ui';
import { ScanResult, Check } from './pipeline';

type Props = {
  result: ScanResult;
  onBack: () => void;
  onVerify: () => void;
  onRescan: () => void;
};

function statusColor(st: Check['status']) {
  if (st === 'clear') return c.ok;
  if (st === 'caution') return c.caution;
  return c.caution;
}

export default function ResultScreen({ result, onBack, onVerify, onRescan }: Props) {
  const when = new Date(result.normalisedAt).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
        <View style={s.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={s.back}>
            <Text style={s.backGlyph}>‹</Text>
          </Pressable>
          <Eyebrow>Checked {when}</Eyebrow>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 14 }}>
          <Text style={s.h1}>
            No red flags found — but that's <Text style={s.em}>not the same</Text> as verified
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
          <Eyebrow>What we checked</Eyebrow>
          <View style={s.card}>
            {result.checks.map((ck, i) => (
              <View
                key={ck.label}
                style={[s.row, i < result.checks.length - 1 && s.rowRule]}
              >
                <View style={[s.dot, { backgroundColor: statusColor(ck.status) }]} />
                <Text style={s.rowLabel}>{ck.label}</Text>
                <Text
                  style={[
                    s.rowValue,
                    ck.status !== 'clear' && { color: c.caution, fontWeight: '500' },
                  ]}
                >
                  {ck.value}
                </Text>
              </View>
            ))}
          </View>
          <Text style={s.stubNote}>
            Checks marked in this build return fixture results — the search providers aren't
            connected yet.
          </Text>
        </View>

        <View style={s.honesty}>
          <Text style={s.honestyTitle}>What this does not mean</Text>
          <Text style={s.honestyBody}>
            {result.heavilyFiltered
              ? 'This image appears heavily processed, which makes photo matching less reliable — so a clean result here counts for less than usual. Most scammers also use photos that were never indexed online.'
              : 'Most scammers use photos that were never indexed online. A clean scan is one data point, not a verdict.'}
          </Text>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 28, gap: 10 }}>
        <PrimaryButton label="Ask for live verification" onPress={onVerify} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SecondaryButton label="Scan another photo" onPress={onRescan} style={{ flex: 1 }} />
          <SecondaryButton
            label="Save & alert me"
            onPress={() =>
              Alert.alert(
                'Saved locally',
                'In this build the cross-user corpus is local only, so nothing is shared yet.'
              )
            }
            style={{ flex: 1 }}
          />
        </View>
        <Text style={s.footer}>Trust your instincts. If something feels off, it often is.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 8 },
  back: { width: 36, height: 44, justifyContent: 'center' },
  backGlyph: { fontSize: 30, color: c.ink, lineHeight: 34 },
  h1: { fontFamily: 'serif', fontSize: 29, lineHeight: 34, letterSpacing: -0.4, color: c.ink },
  em: { fontStyle: 'italic' },
  card: {
    marginTop: 10,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 15 },
  rowRule: { borderBottomWidth: 1, borderBottomColor: c.hairline },
  dot: { width: 9, height: 9, borderRadius: 5 },
  rowLabel: { flex: 1, fontSize: 14, color: c.ink },
  rowValue: { fontSize: 13, color: c.muted },
  stubNote: { marginTop: 9, fontSize: 11.5, lineHeight: 17, color: c.muted, fontStyle: 'italic' },
  honesty: {
    marginHorizontal: 24,
    marginTop: 18,
    padding: 15,
    backgroundColor: c.warm,
    borderRadius: 10,
  },
  honestyTitle: { fontSize: 13, fontWeight: '600', color: c.ink, marginBottom: 6 },
  honestyBody: { fontSize: 13, lineHeight: 20, color: c.mutedDeep },
  footer: { textAlign: 'center', fontSize: 12, color: c.muted, marginTop: 4 },
});
