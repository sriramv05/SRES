import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

import { db } from "../services/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function DriverPickupMap({ alert }) {

  const [driverLocation, setDriverLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijc0NmFlN2EwYmRlNTQ5MDc4NzZjODZkNjdlYjI4ZmY0IiwiaCI6Im11cm11cjY0In0=";

  useEffect(() => {
    if (alert) {
      startTracking();
    }
  }, []);

  const fetchRoute = async (driverLat, driverLng, userLat, userLng) => {

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${driverLng},${driverLat}&end=${userLng},${userLat}`;

    try {

      const response = await fetch(url);
      const data = await response.json();

      const coords = data.features[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));

      setRouteCoords(coords);

      const distanceMeters = data.features[0].properties.summary.distance;
      const durationSeconds = data.features[0].properties.summary.duration;

      setDistance((distanceMeters / 1000).toFixed(2) + " km");
      setDuration(Math.round(durationSeconds / 60) + " mins");

    } catch (err) {
      console.log("Routing error:", err);
    }

  };

  const startTracking = async () => {

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") return;

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
      },
      async (location) => {

        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;

        setDriverLocation({ latitude, longitude });

        try {

          await updateDoc(doc(db, "sosAlerts", alert.id), {
            driverLatitude: latitude,
            driverLongitude: longitude,
          });

        } catch (err) {
          console.log("Firestore update error:", err);
        }

        // Fetch route
        fetchRoute(
          latitude,
          longitude,
          alert.latitude,
          alert.longitude
        );

      }
    );

  };

  if (!alert) return null;

  return (

    <View style={styles.container}>

      {/* Distance + ETA */}
      {distance && (
        <View style={styles.infoBox}>
          <Text>Distance: {distance}</Text>
          <Text>ETA: {duration}</Text>
        </View>
      )}

      {driverLocation && (

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: driverLocation.latitude,
            longitude: driverLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >

          {/* Driver Marker */}
          <Marker
            coordinate={driverLocation}
            title="Driver"
          />

          {/* User Marker */}
          <Marker
            coordinate={{
              latitude: alert.latitude,
              longitude: alert.longitude,
            }}
            title="User"
            pinColor="green"
          />

          {/* Route Line */}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor="blue"
            />
          )}

        </MapView>

      )}

    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  },
  infoBox:{
    position:"absolute",
    top:20,
    alignSelf:"center",
    backgroundColor:"#fff",
    padding:10,
    borderRadius:10,
    zIndex:10
  }
});