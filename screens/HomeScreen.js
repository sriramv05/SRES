import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import SOSButton from '../components/SOSButton';
import { auth } from '../services/firebaseConfig';

export default function HomeScreen() {
  const handleLogout = async () => {
    await auth.signOut();
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Emergency Response</Text>
      <SOSButton />
      <View style={{ marginTop: 30 }}>
        <Button title="Logout" onPress={handleLogout} color="#e63946" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
