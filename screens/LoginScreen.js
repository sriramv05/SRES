import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showRegisterOptions, setShowRegisterOptions] = useState(false);

const handleRegister = async (selectedRole) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      email: email,
      role: selectedRole,
      createdAt: new Date(),
    });

    Alert.alert("Success", "User Registered Successfully. Please Login.");
    setShowRegisterOptions(false);

  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));

    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", uid), {
        email: email,
        role: "user", // default role
        createdAt: new Date(),
      });
    }

    Alert.alert("Success", "Login Successful");

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

      <Button title="Login" onPress={handleLogin} />

      <View style={{ marginTop: 10 }}>
        <Button
          title="Register"
          onPress={() => setShowRegisterOptions(true)}
        />
      </View>

      {showRegisterOptions && (
        <>
          <View style={{ marginTop: 10 }}>
            <Button
              title="Register as User"
              onPress={() => {
                handleRegister("user");
              }}
            />
          </View>

          <View style={{ marginTop: 10 }}>
            <Button
              title="Register as Driver"
              onPress={() => {
                handleRegister("driver");
              }}
            />
          </View>
        </>
      )}
    </View>
  );
}
