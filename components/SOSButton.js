import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

export default function SOSButton() {
  const handlePress = () => {
    Alert.alert('Emergency Alert', 'SOS Alert has been sent!');
    // TODO: Call notification service here
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.buttonText}>🚨 SOS</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'red',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 100,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});