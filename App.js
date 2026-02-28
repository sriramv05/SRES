import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./services/firebaseConfig";

import LoginScreen from "./screens/LoginScreen";
import UserHomeScreen from "./screens/UserHomeScreen";
import DriverHomeScreen from "./screens/DriverHomeScreen";

import { View, ActivityIndicator, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const Stack = createNativeStackNavigator();

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
      } else {
        setUserRole(null);
      }
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("Expo Push Token:", token);
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }
  }

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userRole === "user" ? (
          <Stack.Screen name="UserHome" component={UserHomeScreen} />
        ) : userRole === "driver" ? (
          <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
