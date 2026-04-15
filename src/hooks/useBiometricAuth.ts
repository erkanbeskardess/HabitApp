import { useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import { useTaskStore } from '../store/useTaskStore';

export function useBiometricAuth() {
  const unlockPrivate = useTaskStore((s) => s.unlockPrivate);
  const lockPrivate = useTaskStore((s) => s.lockPrivate);
  const isUnlocked = useTaskStore((s) => s.settings.isPrivateUnlocked);

  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biyometrik Kimlik Doğrulama Yok',
          'Cihazınızda FaceID/Parmak İzi kurulu değil. Gizli görevler için lütfen bir biyometrik kimlik ekleyin.',
        );
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Gizli rutinleri görmek için kimliğini doğrula',
        cancelLabel: 'Vazgeç',
        fallbackLabel: 'Şifre Kullan',
      });

      if (result.success) {
        unlockPrivate();
        return true;
      }
      return false;
    } catch (error) {
      Alert.alert('Hata', 'Kimlik doğrulama sırasında bir sorun oluştu.');
      return false;
    }
  }, [unlockPrivate]);

  return {
    authenticate,
    lock: lockPrivate,
    isUnlocked,
  };
}
