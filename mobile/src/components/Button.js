import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme';

// variant: 'primary' (nen xanh) | 'outline' (vien xanh)
export default function Button({ title, onPress, loading = false, disabled = false, variant = 'primary' }) {
  const outline = variant === 'outline';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        outline ? styles.outline : styles.primary,
        (pressed || inactive) && styles.dimmed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, outline && styles.textOutline]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 46,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primary: { backgroundColor: colors.primary },
  outline: { borderWidth: 1, borderColor: colors.primary, backgroundColor: 'transparent' },
  dimmed: { opacity: 0.6 },
  text: { color: '#fff', fontSize: 15, fontWeight: '600' },
  textOutline: { color: colors.primary },
});
