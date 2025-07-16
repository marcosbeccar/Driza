import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image, ScrollView } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { db, auth } from "../firebase/config";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 15,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset => asset.uri);
      setImages(selectedImages);
    }
  };

  const handleSubmit = () => {
    const userId = auth.currentUser.uid;
    const newPostRef = db.ref('posts').push();
    newPostRef.set({
      title,
      description,
      images,
      createdAt: Date.now(),
      userId,
      savedBy: {} // Inicializa vacío
    })
    .then(() => {
      alert("Post created successfully!");
      setTitle("");
      setDescription("");
      setImages([]);
    })
    .catch((error) => {
      console.error("Error creating post: ", error);
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create a New Post</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Button title="Pick Images" onPress={pickImages} />
      <View style={styles.imagePreview}>
        {images.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.image} />
        ))}
      </View>
      <Button title="Submit Post" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  imagePreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
  },
});

export default CreatePost;