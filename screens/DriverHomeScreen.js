import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
// import { auth, db } from '../services/firebaseConfig';
// import { collection, onSnapshot } from 'firebase/firestore';
import { registerForPushNotificationsAsync } from '../services/notificationsServices';

export default function DriverHomeScreen() {
  const [pickupLocation, setPickupLocation] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
    
    const unsubscribe = onSnapshot(collection(db, 'sosAlerts'), (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          const data = change.doc.data();
          setPickupLocation({
            latitude: data.latitude,
            longitude: data.longitude,
          });
          Alert.alert('🚨 New SOS Alert!', `Pickup at ${data.latitude}, ${data.longitude}`);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleStartPickup = () => {
    if (pickupLocation) {
      Alert.alert('🚑 Pickup Started!', `Heading to: ${pickupLocation.latitude}, ${pickupLocation.longitude}`);
      // Later you can navigate to Google Maps or show directions
    } else {
      Alert.alert('No pickup assigned yet.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👨‍✈️ Driver Dashboard</Text>
      {pickupLocation ? (
        <>
          <Text style={styles.pickupText}>
            🚨 New Pickup Location:{"\n"}
            Lat: {pickupLocation.latitude}{"\n"}
            Lng: {pickupLocation.longitude}
          </Text>
          <Button title="Start Pickup" onPress={handleStartPickup} color="#1d3557" />
        </>
      ) : (
        <Text style={{ marginVertical: 20 }}>Waiting for SOS alerts...</Text>
      )}
      <View style={{ marginTop: 30 }}>
        <Button title="Logout" onPress={handleLogout} color="#e63946" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 30 },
  pickupText: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
});
