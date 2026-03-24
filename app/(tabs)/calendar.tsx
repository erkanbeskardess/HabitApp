import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.emoji}>📅</Text>
        <Text style={styles.title}>Takvim</Text>
        <Text style={styles.subtitle}>Takvim ekranı UI'ı yakında eklenecek.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#F5F5F5', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#A0A0B8' },
});
