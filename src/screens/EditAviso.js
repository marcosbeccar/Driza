// filepath: src/screens/EditAviso.js
import React, { useState, useEffect } from "react";
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
import { getDatabase, ref, get, update } from "firebase/database";
import { auth, app } from "../firebase/config";
import colors from "../styles/colors";
import Header from "../components/Header";

const EditAviso = ({ route, navigation }) => {
  const { postId } = route.params;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [original, setOriginal] = useState(null);

  const db = getDatabase(app);

  useEffect(() => {
    const loadPost = async () => {
      const snap = await get(ref(db, `avisos/${postId}`));
      if (snap.exists()) {
        const data = snap.val();
        setTitle(data.title);
        setDescription(data.description);
        setPhone(data.phone || "");
        setImages(data.images || []);
        setOriginal(data);
      }
    };
    loadPost();
  }, [postId]);

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 10,
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
      setErrorMessage("No se pudieron seleccionar imágenes.");
    }
  };

  const hasChanges = () => {
    if (!original) return false;
    return (
      title !== original.title ||
      description !== original.description ||
      phone !== (original.phone || "") ||
      JSON.stringify(images) !== JSON.stringify(original.images || [])
    );
  };

  const handleSubmit = async () => {
    if (loading || !hasChanges()) return;
    setLoading(true);
    try {
      // Validaciones
      if (!title.trim()) {
        setErrorMessage("El título es obligatorio.");
        setLoading(false);
        return;
      }
      if (title.trim().length > 65) {
        setErrorMessage("El título no puede superar los 65 caracteres.");
        setLoading(false);
        return;
      }
      if (!description.trim()) {
        setErrorMessage("La descripción es obligatoria.");
        setLoading(false);
        return;
      }
      if (description.trim().length > 4000) {
        setErrorMessage("La descripción no puede superar los 4000 caracteres.");
        setLoading(false);
        return;
      }

      // Teléfono opcional
      const digitsOnly = phone.replace(/\D/g, "");
      if (phone.trim()) {
        if (digitsOnly.length < 10) {
          setErrorMessage("El teléfono es muy corto.");
          setLoading(false);
          return;
        }
        if (digitsOnly.length > 20) {
          setErrorMessage("El teléfono es muy largo.");
          setLoading(false);
          return;
        }
      }

      await update(ref(db, `avisos/${postId}`), {
        title: title.trim(),
        description: description.trim(),
        phone: phone.trim(),
        images,
      });

      setErrorMessage("✅ Cambios aplicados exitosamente!");
      setOriginal({ ...original, title, description, phone, images });
    } catch (error) {
      console.error("Error editando aviso:", error);
      setErrorMessage("Ocurrió un error al aplicar cambios.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header backButton />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Editar Aviso</Text>

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
          value={title}
          onChangeText={setTitle}
        />
        <Text style={[styles.counter, title.length > 65 && styles.counterError]}>
          {`${title.length}/65`}
        </Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text
          style={[styles.counter, description.length > 4000 && styles.counterError]}
        >
          {`${description.length}/4000`}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Teléfono / WhatsApp (opcional)"
          value={phone}
          onChangeText={setPhone}
        />

        <TouchableOpacity style={styles.button} onPress={pickImages}>
          <Text style={styles.buttonText}>Seleccionar Imágenes</Text>
        </TouchableOpacity>

        <View style={styles.imagePreview}>
          {images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.image} />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!hasChanges() || loading) && { opacity: 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={!hasChanges() || loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Aplicando..." : "Aplicar cambios"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  message: { fontSize: 16, marginBottom: 15, textAlign: "center", fontWeight: "600" },
  error: { color: "red" },
  success: { color: "green" },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: "#fff",
    color: colors.textPrimary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    fontSize: 16,
  },
  textArea: { height: 120, textAlignVertical: "top" },
  counter: { alignSelf: "flex-end", marginBottom: 12, color: colors.textSecondary, fontSize: 12 },
  counterError: { color: "red" },
  button: { backgroundColor: colors.secondaryButton, paddingVertical: 12, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  imagePreview: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  image: { width: 100, height: 100, borderRadius: 8, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  submitButton: { backgroundColor: colors.primaryButton, paddingVertical: 14, borderRadius: 8, alignItems: "center", marginBottom: 30 },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});

export default EditAviso;
