import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { c } from './theme';
import { Eyebrow, SecondaryButton } from './ui';
import { randomGesture } from './pipeline';

type Props = { onBack: () => void };

const WINDOW_SECONDS = 90;

export default function VerifyScreen({ onBack }: Props) {
  const [gesture, setGesture] = React.useState(randomGesture);
  const [left, setLeft] = React.useState(WINDOW_SECONDS);

  React.useEffect(() => {
    setLeft(WINDOW_SECONDS);
    const t = setInterval(() => setLeft((n) => (n > 0 ? n - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [gesture]);

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');

  async function send() {
    try {
      await Share.share({ message: gesture });
    } catch (e: any) {
      Alert.alert('Could not share', String(e?.message ?? e));
    }
  }

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={s.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={s.back}>
            <Text style={s.backGlyph}>‹</Text>
          </Pressable>
          <Eyebrow>Live verification</Eyebrow>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 10 }}>
          <Text style={s.h1}>
            The one thing a stolen photo <Text style={s.em}>can't</Text> do
          </Text>
          <Text style={s.lede}>
            Send a prompt only the real person can answer, right now. No forensics model beats this.
          </Text>
        </View>

        <View style={s.promptCard}>
          <View style={s.promptHead}>
            <Text style={s.promptEyebrow}>Your prompt</Text>
            <Text style={[s.timer, left === 0 && { color: '#E79A8C' }]}>
              {left === 0 ? 'Expired' : `Expires in ${mm}:${ss}`}
            </Text>
          </View>
          <Text style={s.promptText}>{gesture}</Text>
          <Text style={s.promptNote}>Randomised just now, so it can't be prepared in advance.</Text>

          <View style={s.promptActions}>
            <Pressable
              accessibilityRole="button"
              onPress={send}
              style={({ pressed }) => [s.sendBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={s.sendLabel}>Copy &amp; send</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get a different prompt"
              onPress={() => setGesture(randomGesture())}
              style={({ pressed }) => [s.reroll, pressed && { opacity: 0.75 }]}
            >
              <Text style={s.rerollGlyph}>↻</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <Eyebrow>How to read their reply</Eyebrow>

          <Guide
            n="1"
            bg={c.okBg}
            ink={c.okInk}
            lead="They send it within a few minutes."
            body="Strong signal — but check the gesture actually matches."
          />
          <Guide
            n="2"
            bg={c.cautionBg}
            ink={c.caution}
            lead="They stall or send an old photo."
            body="Common and not proof of anything — but ask again later."
            ruled
          />
          <Guide
            n="3"
            bg={c.alertBg}
            ink={c.alertInk}
            lead="They get angry or guilt-trip you."
            body="A real person is usually fine with it. Treat this as the finding."
            ruled
          />
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 28 }}>
        <SecondaryButton
          label="Log what happened"
          onPress={() => Alert.alert('Not wired up yet', 'Outcome logging lands with the backend.')}
        />
      </View>
    </View>
  );
}

function Guide({
  n,
  bg,
  ink,
  lead,
  body,
  ruled,
}: {
  n: string;
  bg: string;
  ink: string;
  lead: string;
  body: string;
  ruled?: boolean;
}) {
  return (
    <View style={[s.guide, ruled && s.guideRule]}>
      <View style={[s.guideNum, { backgroundColor: bg }]}>
        <Text style={[s.guideNumText, { color: ink }]}>{n}</Text>
      </View>
      <Text style={s.guideBody}>
        <Text style={s.guideLead}>{lead}</Text> {body}
      </Text>
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
  lede: { fontSize: 14, lineHeight: 22, color: c.muted, marginTop: 12 },
  promptCard: {
    marginHorizontal: 24,
    marginTop: 22,
    padding: 20,
    backgroundColor: c.dark,
    borderRadius: 12,
  },
  promptHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  promptEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: c.darkMuted,
  },
  timer: { fontSize: 12, fontWeight: '500', color: c.amber },
  promptText: { fontFamily: 'serif', fontSize: 24, lineHeight: 32, color: c.inkInv },
  promptNote: { fontSize: 12.5, lineHeight: 19, color: c.darkMuted, marginTop: 10 },
  promptActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: c.darkRule,
  },
  sendBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: c.inkInv,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendLabel: { fontSize: 14.5, fontWeight: '600', color: c.ink },
  reroll: {
    width: 46,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A414C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rerollGlyph: { fontSize: 20, color: c.darkFaint },
  guide: { flexDirection: 'row', gap: 12, paddingVertical: 13 },
  guideRule: { borderTopWidth: 1, borderTopColor: '#E8E5DE' },
  guideNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  guideNumText: { fontSize: 12, fontWeight: '600' },
  guideBody: { flex: 1, fontSize: 13.5, lineHeight: 20, color: '#3A414C' },
  guideLead: { fontWeight: '600', color: c.ink },
});
