import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdSection = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Ad Section Placeholder</Text>
    <Text>This is where the ads will be displayed.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 10 },
  title: { fontWeight: 'bold', fontSize: 18 },
});

export default AdSection;