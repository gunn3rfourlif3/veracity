import React from 'react';
import { Text, View, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { c } from './theme';

export function H1({ children }: { children: React.ReactNode }) {
  return <Text style={s.h1}>{children}</Text>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={s.eyebrow}>{children}</Text>;
}

export function Body({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[s.body, style]}>{children}</Text>;
}

export function PrimaryButton({
  label,
  sub,
  onPress,
}: {
  label: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.primary, pressed && s.pressed]}
    >
      <Text style={s.primaryLabel}>{label}</Text>
      {sub ? <Text style={s.primarySub}>{sub}</Text> : null}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.secondary, style, pressed && s.pressed]}
    >
      <Text style={s.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function SourceRow({
  title,
  detail,
  onPress,
}: {
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.sourceRow, pressed && s.pressed]}
    >
      <View style={s.sourceIcon} />
      <View style={{ flex: 1 }}>
        <Text style={s.sourceTitle}>{title}</Text>
        <Text style={s.sourceDetail}>{detail}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  h1: {
    fontFamily: 'serif',
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: c.ink,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: c.muted,
  },
  body: { fontSize: 14.5, lineHeight: 22, color: c.muted },
  primary: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: c.dark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryLabel: { color: c.inkInv, fontSize: 16.5, fontWeight: '600' },
  primarySub: { color: '#CFD6DE', fontSize: 12.5, marginTop: 2 },
  secondary: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryLabel: { color: c.ink, fontSize: 14, fontWeight: '500' },
  pressed: { opacity: 0.72 },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 68,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
  },
  sourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: c.accentBg,
  },
  sourceTitle: { fontSize: 15, fontWeight: '600', color: c.ink },
  sourceDetail: { fontSize: 13, color: c.muted, marginTop: 2 },
});
