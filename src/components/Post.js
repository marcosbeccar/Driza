import React from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import colors from '../styles/colors';

const Post = ({ title, images = [], description, savedCount = 0, onSave, onBuy }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.imageContainer}>
        {images.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.image} />
        ))}
      </View>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.savedCount}>Guardado por {savedCount} usuario/s</Text>
      {onSave && <Button title="Guardar" onPress={onSave} />}
      {onBuy && <Button title="Buy" onPress={onBuy} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 5,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 10,
  },
  savedCount: {
    fontSize: 12,
    color: '#228bfa',
    marginBottom: 10,
  },
});

export default Post;