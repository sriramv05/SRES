import React, { useEffect } from 'react'; // <-- import useEffect correctly
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../services/firebaseConfig';
import * as Location from 'expo-location';
import { collection, getDocs, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { registerForPushNotificationsAsync } from '../services/notificationsServices';

export default function UserHomeScreen() {
  // ✅ useEffect must be inside component
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {

  const q = query(
    collection(db, "sosAlerts"),
    where("userId", "==", auth.currentUser.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {

    snapshot.docChanges().forEach((change) => {

      const data = change.doc.data();

      if (change.type === "modified") {

        if (data.status === "accepted") {

          Alert.alert(
            "SOS Update",
            "A driver has accepted your SOS alert."
          );

        }

        if (data.status === "completed") {

          Alert.alert(
            "SOS Update",
            "Your emergency request has been completed."
          );

        }

      }

    });

  });

  return () => unsubscribe();

}, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const sendPushNotification = async (expoPushToken, location) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: '🚨 SOS Alert!',
      body: `User needs help at 📍 (${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)})`,
      data: { location },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  const sendSOSAlert = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log('SOS Sent! 📍 Location:', location.coords);

      // Fetch all drivers from Firestore and send notification
      const driversSnapshot = await getDocs(collection(db, 'drivers'));
      driversSnapshot.forEach(async (docSnap) => {
        const driverData = docSnap.data();
        if (driverData.expoPushToken) {
          await sendPushNotification(driverData.expoPushToken, location.coords);
        }
      });
      await addDoc(collection(db, 'sosAlerts'), {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(),

        userId: auth.currentUser.uid,  

        picked: false,
        pickedBy: null,
        status: "waiting",
      });

      Alert.alert('🚨 SOS Alert Sent', `Location: ${location.coords.latitude}, ${location.coords.longitude}`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send SOS alert.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 Emergency Dashboard</Text>
      <Button title="Send SOS Alert" color="#e63946" onPress={sendSOSAlert} />
      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 }
});
