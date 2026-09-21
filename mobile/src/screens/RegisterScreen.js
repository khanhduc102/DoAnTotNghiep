import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import TextField from '../components/TextField';
import Button from '../components/Button';
import ErrorBanner from '../components/ErrorBanner';
import { toFieldErrors } from '../api/client';
import { colors, radius, spacing } from '../theme';

const ROLES = [
  { value: 'TENANT', title: 'Tôi muốn thuê', desc: 'Tìm phòng, gửi yêu cầu thuê' },
  { value: 'OWNER', title: 'Tôi cho thuê', desc: 'Đăng phòng, quản lý khách thuê' },
];

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'TENANT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const update = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    setError('');
    setFieldErrors({});

    // Kiem tra nhap lai mat khau o may, server khong can biet truong nay
    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Mật khẩu nhập lại không khớp' });
      return;
    }

    setLoading(true);
    try {
      await signUp({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        // So dien thoai khong bat buoc: de trong thi khong gui
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      });
    } catch (err) {
      setFieldErrors(toFieldErrors(err.errors));
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.section}>Bạn là</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => {
            const active = form.role === r.value;
            return (
              <Pressable
                key={r.value}
                onPress={() => update('role')(r.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.roleCard, active && styles.roleCardActive]}
              >
                <Text style={[styles.roleTitle, active && styles.roleTitleActive]}>{r.title}</Text>
                <Text style={styles.roleDesc}>{r.desc}</Text>
              </Pressable>
            );
          })}
        </View>
        {fieldErrors.role ? <Text style={styles.error}>{fieldErrors.role}</Text> : null}

        <ErrorBanner message={error} />

        <TextField label="Họ và tên" value={form.fullName} onChangeText={update('fullName')}
          placeholder="Nguyễn Văn A" autoComplete="name" error={fieldErrors.fullName} />
        <TextField label="Email" value={form.email} onChangeText={update('email')}
          placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none"
          autoComplete="email" error={fieldErrors.email} />
        <TextField label="Số điện thoại (không bắt buộc)" value={form.phone} onChangeText={update('phone')}
          placeholder="0912345678" keyboardType="phone-pad" error={fieldErrors.phone} />
        <TextField label="Mật khẩu" value={form.password} onChangeText={update('password')}
          placeholder="Tối thiểu 6 ký tự" secureTextEntry error={fieldErrors.password} />
        <TextField label="Nhập lại mật khẩu" value={form.confirmPassword} onChangeText={update('confirmPassword')}
          placeholder="Nhập lại mật khẩu" secureTextEntry error={fieldErrors.confirmPassword} />

        <View style={styles.gap} />
        <Button title="Tạo tài khoản" onPress={handleRegister} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  container: { padding: spacing.xl, paddingBottom: 48 },
  section: { fontSize: 13, color: colors.muted, marginBottom: spacing.sm },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: spacing.md,
  },
  roleCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  roleTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  roleTitleActive: { color: colors.primary },
  roleDesc: { fontSize: 12, color: colors.muted, marginTop: spacing.xs },
  error: { color: colors.danger, fontSize: 12, marginTop: -spacing.sm, marginBottom: spacing.md },
  gap: { height: spacing.sm },
});
