import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert } from "react-native";

import { auth, db } from "../services/firebaseConfig";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

import DriverPickupMap from "./DriverPickupMap";

export default function DriverHomeScreen() {

  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {

    const unsubscribe = onSnapshot(collection(db, "sosAlerts"), (snapshot) => {

      const data = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }))
        .filter(alert => alert.status !== "completed");

      data.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);

      setAlerts(data);

    });

    return () => unsubscribe();

  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const startPickup = async (alert) => {

    if (alert.picked) {
      Alert.alert("Already Picked", "Another driver accepted this alert");
      return;
    }

    await updateDoc(doc(db, "sosAlerts", alert.id), {
      picked: true,
      pickedBy: auth.currentUser.uid,
      status: "accepted"
    });

  };

  const completeSOS = async (alert) => {

    await updateDoc(doc(db, "sosAlerts", alert.id), {
      status: "completed"
    });

    Alert.alert("SOS Completed");

  };

  const renderAlert = ({ item }) => {

    return (

      <View style={styles.card}>

        <Text style={styles.location}>
          📍 {item.latitude}, {item.longitude}
        </Text>

        <Text style={styles.status}>
          Status: {item.status}
        </Text>

        <View style={{ marginTop: 10 }}>

          {!item.picked ? (

            <Button
              title="Start Pickup"
              onPress={() => startPickup(item)}
            />

          ) : (

            <>
              <Text style={{ color: "green", marginBottom: 6 }}>
                Picked
              </Text>

              {item.pickedBy === auth.currentUser.uid && item.status !== "completed" && (

                <>
                  <Button
                    title="Open Map"
                    onPress={() => {
                      setSelectedAlert(item);
                      setShowMap(true);
                    }}
                  />

                  <View style={{ marginTop: 8 }}>
                    <Button
                      title="Complete SOS"
                      color="green"
                      onPress={() => completeSOS(item)}
                    />
                  </View>
                </>

              )}

            </>

          )}

        </View>

      </View>

    );

  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>🚑 Driver Dashboard</Text>

      {alerts.length === 0 ? (
        <Text style={styles.noAlerts}>
          Waiting for SOS alerts...
        </Text>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderAlert}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {showMap && selectedAlert && (

        <View style={styles.mapOverlay}>

          <View style={styles.mapCard}>

            <Text
              style={styles.closeButton}
              onPress={() => setShowMap(false)}
            >
              ✕
            </Text>

            <DriverPickupMap alert={selectedAlert} />

          </View>

        </View>

      )}

      <View style={styles.logoutContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          color="#e63946"
        />
      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fff"
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 25
  },

  noAlerts: {
    textAlign: "center",
    fontSize: 16,
    color: "gray",
    marginTop: 40
  },

  card: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2
  },

  location: {
    fontSize: 16,
    fontWeight: "500"
  },

  status: {
    marginTop: 5,
    color: "#555"
  },

  logoutContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20
  },

  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  },

  mapCard: {
    width: "90%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden"
  },

  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    fontSize: 22,
    fontWeight: "bold",
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20
  }

});