import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import { useLoginHandler } from "../../authentication/LoginHandler";
import { useWixSession } from "../../authentication/session";
import { DismissKeyboardSafeAreaView } from "../DismissKeyboardHOC/DismissKeyboardSafeAreaView";
import Routes from "../../routes/routes";

export function LoginForm({ navigation, loading, disabled, onWixLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { sessionLoading } = useWixSession();
  const { login } = useLoginHandler();

  const loginHandler = async () => {
    setError(false);
    try {
      await login(email, password);
      navigation.navigate(Routes.Home);
    } catch (e) {
      setErrorMessage(e.toString());
      setError(true);
    }
  };

  return (
    <DismissKeyboardSafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.inputView}>
        <TextInput
          theme={{ colors: { primary: "#403F2B" } }}
          style={styles.input}
          value={email}
          mode={"outlined"}
          onChangeText={(text) => {
            setEmail(text);
            setError(false);
          }}
          autoCorrect={false}
          autoCapitalize="none"
          label={"Email"}
        />
        <TextInput
          theme={{ colors: { primary: "#403F2B" } }}
          mode={"outlined"}
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(false);
          }}
          autoCorrect={false}
          autoCapitalize="none"
          label={"Password"}
        />
        <Button
          style={styles.loginButton}
          mode="contained"
          onPress={loginHandler}
          loading={sessionLoading}
        >
          Login
        </Button>
        {!sessionLoading && (
          <HelperText type="error" visible={error}>
            {errorMessage}
          </HelperText>
        )}
        <Text style={{ textAlign: "center", color: "#403F2B" }}>
          Or login with Wix Managed Login
        </Text>
        <Button
          style={styles.wixLoginButton}
          mode="outlined"
          icon={"login"}
          loading={loading}
          disabled={disabled}
          onPress={onWixLogin}
          theme={{ colors: { primary: "#403F2B" } }}
        >
          Wix Managed Login
        </Button>
      </View>
    </DismissKeyboardSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: "normal",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 40,
    color: "#403F2B",
    fontFamily: "Fraunces-Regular",
    letterSpacing: 2,
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 50,
  },
  input: {
    minWidth: "100%",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  loginButton: {
    backgroundColor: "#403F2B",
  },
  wixLoginButton: {
    borderColor: "#403F2B",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
});
