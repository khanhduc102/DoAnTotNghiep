// Dieu huong theo trang thai dang nhap va vai tro.
// Moi vai tro chi duoc DANG KY man hinh cua minh: TENANT khong the dieu huong toi man OWNER
// vi man do khong ton tai trong cay dieu huong (cach lam khuyen nghi cua React Navigation).
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TenantHomeScreen from '../screens/TenantHomeScreen';
import OwnerHomeScreen from '../screens/OwnerHomeScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {status !== 'signedIn' ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Tạo tài khoản' }} />
        </>
      ) : user.role === 'OWNER' ? (
        <Stack.Screen name="OwnerHome" component={OwnerHomeScreen} options={{ title: 'Quản lý cho thuê' }} />
      ) : (
        <Stack.Screen name="TenantHome" component={TenantHomeScreen} options={{ title: 'DucHome' }} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
});
