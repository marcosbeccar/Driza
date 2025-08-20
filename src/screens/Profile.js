import React, { Component } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { auth, db } from "../firebase/config";
import Post from "../components/Post";
import colors from "../styles/colors";

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: "",
      email: "",
      posts: [],
      loading: true,
    };
  }

  componentDidMount() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      this.setState({ email: currentUser.email });

      // Obtener datos del usuario
      db.ref(`users/${currentUser.uid}`).once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          this.setState({ userName: userData.userName || "Usuario" });
        }
      });

      // Obtener posts del usuario
      db.ref('posts').on('value', (snapshot) => {
        const allPosts = snapshot.val() || {};
        const userPosts = Object.entries(allPosts)
          .filter(([id, post]) => post.userId === currentUser.uid)
          .map(([id, post]) => ({ id, ...post }));
        this.setState({ posts: userPosts, loading: false });
      });
    }
  }

  handleLogout = () => {
    auth.signOut().then(() => {
      this.props.navigation.navigate("Login");
    });
  };

  deletePost = (postId) => {
    db.ref(`posts/${postId}`).remove().then(() => {
      this.setState((prevState) => ({
        posts: prevState.posts.filter((post) => post.id !== postId),
      }));
    });
  };

  render() {
    const { userName, email, posts, loading } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Perfil de {userName}</Text>
        <Text style={styles.email}>Email: {email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={this.handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>Tus Posts:</Text>
        {loading ? (
          <Text>Cargando...</Text>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(post) => post.id}
            renderItem={({ item }) => (
              <View style={styles.postContainer}>
                <Post
                  title={item.title}
                  images={item.images}
                  description={item.description}
                  savedCount={item.savedBy ? Object.keys(item.savedBy).length : 0}
                  postId={item.id}
                />
                <TouchableOpacity style={styles.deleteButton} onPress={() => this.deletePost(item.id)}>
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#228bfa",
    textAlign: "center",
    marginVertical: 10,
  },
  email: {
    fontSize: 16,
    color: "#3386F9",
    textAlign: "center",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#4a90e2",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a90e2",
    marginBottom: 10,
  },
  postContainer: {
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  text: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});