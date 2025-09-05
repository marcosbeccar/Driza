import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getDatabase, ref, push, set, get } from "firebase/database";
import { auth, app } from "../firebase/config"; // asegúrate que config exporte `app` y `auth`
import colors from "../styles/colors";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [categoria, setCategoria] = useState("normal"); // default

  // DB modular
  const db = getDatabase(app);

  const pickImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permiso denegado", "Necesitamos permisos para acceder a las imágenes.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 15,
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map((asset) => asset.uri);
        setImages(selectedImages);
      }
    } catch (err) {
      console.error("Error pickImages:", err);
      Alert.alert("Error", "No se pudieron seleccionar las imágenes.");
    }
  };

  const handleSubmit = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "Debes iniciar sesión para crear una publicación.");
        return;
      }

      // Obtener organización del usuario (si existe)
      const userRef = ref(db, `users/${currentUser.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.exists() ? userSnap.val() : null;
      const organizacion = userData?.organizacion || "NO";

      // Crear nuevo post (modular)
      const newPostRef = push(ref(db, "posts"));
      await set(newPostRef, {
        title: title.trim(),
        description: description.trim(),
        images: images,
        categoria: categoria || "normal",
        createdAt: Date.now(),
        userId: currentUser.uid,
        organizacion,
        savedBy: {},
      });

      Alert.alert("Éxito", "Post creado exitosamente!");
      setTitle("");
      setDescription("");
      setImages([]);
      setCategoria("normal");
    } catch (error) {
      console.error("Error creando el post:", error);
      Alert.alert("Error", "Ocurrió un error al crear el post.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Publicación</Text>

      <TextInput
        style={styles.input}
        placeholder="Título"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción"
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Si más adelante querés que el admin ponga otra categoría en la UI, se puede exponer aquí.
          Por ahora lo dejamos en "normal" por defecto */}
      <TouchableOpacity style={styles.button} onPress={pickImages}>
        <Text style={styles.buttonText}>Seleccionar Imágenes</Text>
      </TouchableOpacity>

      <View style={styles.imagePreview}>
        {images.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.image} />
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Publicar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
    alignItems: "stretch",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: "#fff",
    color: colors.textPrimary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: colors.secondaryButton,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitButton: {
    backgroundColor: colors.primaryButton,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default CreatePost;
