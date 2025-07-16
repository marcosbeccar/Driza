import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { auth } from '../firebase/config';

const VerifyEmail = ({ navigation }) => {
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      user.reload().then(() => {
        if (user.emailVerified) {
          navigation.navigate('Home');
        }
      });
    }
  }, [navigation]);

  const handleResendVerification = () => {
    const user = auth.currentUser;
    if (user) {
      user.sendEmailVerification()
        .then(() => {
          alert('Verification email sent!');
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.message}>
        A verification email has been sent to your email address. Please check your inbox and verify your email to continue.
      </Text>
      <Button title="Resend Verification Email" onPress={handleResendVerification} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#c3e6fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default VerifyEmail;