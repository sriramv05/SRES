import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert } from "react-native";

import { auth, db } from "../services/firebaseConfig";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function DriverHomeScreen() {

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {

    const unsubscribe = onSnapshot(collection(db, "sosAlerts"), (snapshot) => {

      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));

      // newest alert first
      data.sort((a,b)=> b.timestamp?.seconds - a.timestamp?.seconds)

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

    await updateDoc(doc(db,"sosAlerts",alert.id),{
      picked:true,
      pickedBy:auth.currentUser.uid,
      status:"accepted"
    });

    Alert.alert("Pickup Started");

  };

  const renderAlert = ({item}) => {

    return(
      <View style={styles.card}>

        <Text style={styles.location}>
          📍 {item.latitude}, {item.longitude}
        </Text>

        <Text style={styles.status}>
          Status: {item.picked ? "Picked" : "Waiting"}
        </Text>

        {!item.picked && (
          <View style={{marginTop:8}}>
            <Button
              title="Start Pickup"
              onPress={()=> startPickup(item)}
            />
          </View>
        )}

      </View>
    )
  }

  return (
    <View style={styles.container}>

      {/* TITLE */}
      <Text style={styles.title}>🚑 Driver Dashboard</Text>

      {/* ALERT LIST */}
      {alerts.length === 0 ? (
        <Text style={styles.noAlerts}>Waiting for SOS alerts...</Text>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item)=>item.id}
          renderItem={renderAlert}
          contentContainerStyle={{paddingBottom:100}}
        />
      )}

      {/* LOGOUT BUTTON */}
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} color="#e63946"/>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    paddingHorizontal:20,
    backgroundColor:"#fff"
  },

  title:{
    fontSize:26,
    fontWeight:"bold",
    textAlign:"center",
    marginTop:60,
    marginBottom:25
  },

  noAlerts:{
    textAlign:"center",
    fontSize:16,
    color:"gray",
    marginTop:40
  },

  card:{
    backgroundColor:"#f2f2f2",
    padding:15,
    marginBottom:12,
    borderRadius:10,
    elevation:2
  },

  location:{
    fontSize:16,
    fontWeight:"500"
  },

  status:{
    marginTop:5,
    color:"#555"
  },

  logoutContainer:{
    position:"absolute",
    bottom:40,
    left:20,
    right:20
  }

});