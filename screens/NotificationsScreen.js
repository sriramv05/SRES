import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function NotificationsScreen() {
  const [logs, setLogs] = useState([
    { id: '1', message: 'Emergency Alert Sent at 10:42 AM' },
    { id: '2', message: 'Emergency Alert Sent at 9:15 AM' },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification History</Text>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.message}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    paddingVertical: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});
