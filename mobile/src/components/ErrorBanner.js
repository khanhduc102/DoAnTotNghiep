import { StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return <Text style={styles.banner}>{message}</Text>;
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.dangerSoft,
    color: colors.danger,
    padding: spacing.md,
    borderRadius: radius,
    marginBottom: spacing.md,
    fontSize: 14,
  },
});
