import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { db, auth } from "../firebase/config";

const Chat = ({ postId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const messagesRef = db.ref(`chats/${postId}`);
    const handleData = (snapshot) => {
      const data = snapshot.val() || {};
      const msgArray = Object.entries(data).map(([id, msg]) => ({
        id,
        ...msg,
      }));
      // Ordena por timestamp ascendente
      msgArray.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(msgArray);
    };
    messagesRef.on("value", handleData);
    return () => messagesRef.off("value", handleData);
  }, [postId]);

  const sendMessage = () => {
    if (input.trim() === "") return;
    const userId = auth.currentUser.uid;
    const userName = auth.currentUser.displayName || "Usuario";
    const newMsgRef = db.ref(`chats/${postId}`).push();
    newMsgRef.set({
      userId,
      userName,
      text: input,
      timestamp: Date.now(),
    });
    setInput("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat del Post</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.userName}>{item.userName}:</Text>
            <Text style={styles.message}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
        />
        <Button title="Enviar" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  messageContainer: { marginBottom: 8, flexDirection: "row" },
  userName: { fontWeight: "bold", marginRight: 5 },
  message: { flex: 1 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8, marginRight: 10 },
});

export default Chat;

