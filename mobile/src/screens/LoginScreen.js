import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import TextField from '../components/TextField';
import Button from '../components/Button';
import ErrorBanner from '../components/ErrorBanner';
import { toFieldErrors } from '../api/client';
import { colors, spacing } from '../theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLogin = async () => {
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Dang nhap xong, RootNavigator tu chuyen sang man hinh theo vai tro
    } catch (err) {
      setFieldErrors(toFieldErrors(err.errors));
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>DH</Text>
            </View>
            <Text style={styles.title}>DucHome</Text>
            <Text style={styles.subtitle}>Tìm phòng trọ và quản lý cho thuê</Text>
          </View>

          <ErrorBanner message={error} />

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={fieldErrors.email}
          />
          <TextField
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            secureTextEntry
            error={fieldErrors.password}
          />

          <View style={styles.gap} />
          <Button title="Đăng nhập" onPress={handleLogin} loading={loading} />

          <Pressable style={styles.link} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>
              Chưa có tài khoản? <Text style={styles.linkStrong}>Đăng ký</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: spacing.xs },
  gap: { height: spacing.sm },
  link: { marginTop: spacing.lg, alignItems: 'center', padding: spacing.sm },
  linkText: { color: colors.muted, fontSize: 14 },
  linkStrong: { color: colors.primary, fontWeight: '600' },
});
