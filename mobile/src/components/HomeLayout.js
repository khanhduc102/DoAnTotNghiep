// Khung chung cho trang chu TENANT va OWNER: loi chao, the so lieu, nut dang xuat.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import ErrorBanner from './ErrorBanner';
import { colors, radius, spacing } from '../theme';

const ROLE_LABEL = { TENANT: 'Khách thuê', OWNER: 'Chủ trọ' };

export function StatCard({ label, value, highlight = false }) {
  return (
    <View style={[styles.card, highlight && styles.cardHighlight]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, highlight && styles.cardValueHighlight]}>{value}</Text>
    </View>
  );
}

// loadDashboard: ham goi API dashboard cua role; renderStats(data) ve cac StatCard
export default function HomeLayout({ loadDashboard, renderStats, note }) {
  const { user, signOut } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await loadDashboard());
    } catch (err) {
      setError(err.message);
    }
  }, [loadDashboard]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.hello}>Xin chào,</Text>
      <Text style={styles.name}>{user?.fullName}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{ROLE_LABEL[user?.role] || user?.role}</Text>
      </View>

      <ErrorBanner message={error} />

      {data ? (
        <View style={styles.grid}>{renderStats(data)}</View>
      ) : !error ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : null}

      {note ? <Text style={styles.note}>{note}</Text> : null}

      <View style={styles.footer}>
        <Button title="Đăng xuất" variant="outline" onPress={handleSignOut} loading={signingOut} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: 48 },
  hello: { fontSize: 15, color: colors.muted },
  name: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  badgeText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardHighlight: { borderColor: colors.primary },
  cardLabel: { fontSize: 13, color: colors.muted },
  cardValue: { fontSize: 26, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  cardValueHighlight: { color: colors.primary },
  loader: { marginVertical: spacing.xl },
  note: { fontSize: 13, color: colors.muted, marginTop: spacing.lg, lineHeight: 19 },
  footer: { marginTop: spacing.xl },
});
