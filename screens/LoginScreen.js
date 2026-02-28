import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        role,
      });

      Alert.alert("Success", "User Registered Successfully");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert("Login Error", error.message);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 100 }}>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Button title="Register as User" onPress={() => setRole("user")} />
      <Button title="Register as Driver" onPress={() => setRole("driver")} />

      <View style={{ marginTop: 10 }}>
        <Button title="Register" onPress={handleRegister} />
      </View>

      <View style={{ marginTop: 10 }}>
        <Button title="Login" onPress={handleLogin} />
      </View>
    </View>
  );
}
