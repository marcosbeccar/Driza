// filepath: src/screens/CreateAviso.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getDatabase, ref, push, set, get } from "firebase/database";
import { auth, app } from "../firebase/config";
import colors from "../styles/colors";

const CreateAviso = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const db = getDatabase(app);

  const pickImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Necesitamos permisos para acceder a las imágenes.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10, // máximo 10 imágenes
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map((asset) => asset.uri);
        if (selectedImages.length + images.length > 10) {
          setErrorMessage("No se pueden subir más de 10 imágenes en total.");
          return;
        }
        setImages([...images, ...selectedImages]);
      }
    } catch (err) {
      console.error("Error pickImages:", err);
      setErrorMessage("No se pudieron seleccionar las imágenes.");
    }
  };

  const handleSubmit = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setErrorMessage("Debes iniciar sesión para crear un aviso.");
        return;
      }

      if (!title.trim()) {
        setErrorMessage("El título es obligatorio.");
        return;
      }
      if (!description.trim()) {
        setErrorMessage("La descripción es obligatoria.");
        return;
      }

      const userRef = ref(db, `users/${currentUser.uid}`);
      const userSnap = await get(userRef);
      const userData = userSnap.exists() ? userSnap.val() : null;
      const organizacion = userData?.organizacion || "NO";

      const newAvisoRef = push(ref(db, "avisos"));
      await set(newAvisoRef, {
        title: title.trim(),
        description: description.trim(),
        phone: phone.trim() || "", // opcional
        email: currentUser.email,
        images: images, // opcional
        createdAt: Date.now(),
        userId: currentUser.uid,
        organizacion,
        estado: "normal", // por defecto
        savedBy: {}, 
      });

      setErrorMessage("✅ Aviso publicado exitosamente!");
      setTitle("");
      setDescription("");
      setPhone("");
      setImages([]);
    } catch (error) {
      console.error("Error creando el aviso:", error);
      setErrorMessage("Ocurrió un error al crear el aviso.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Publicar Aviso</Text>

      {errorMessage ? (
        <Text
          style={[
            styles.message,
            errorMessage.startsWith("✅") ? styles.success : styles.error,
          ]}
        >
          {errorMessage}
        </Text>
      ) : null}

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

      <TextInput
        style={styles.input}
        placeholder="Teléfono / WhatsApp (opcional)"
        placeholderTextColor={colors.textSecondary}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={pickImages}>
        <Text style={styles.buttonText}>Seleccionar Imágenes (opcional)</Text>
      </TouchableOpacity>

      <View style={styles.imagePreview}>
        {images.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.image} />
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Publicar Aviso</Text>
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
  message: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  error: {
    color: "red",
  },
  success: {
    color: "green",
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

export default CreateAviso;
