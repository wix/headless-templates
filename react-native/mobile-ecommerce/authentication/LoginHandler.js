import {
  exchangeCodeAsync,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import * as Linking from "expo-linking";
import * as React from "react";
import "react-native-gesture-handler";
import "react-native-url-polyfill/auto";
import { WebView } from "react-native-webview";
import validator from "validator";
import { useWixSession } from "./session";
import { wixCient } from "./wixClient";

const LoginHandlerContext = React.createContext(null);

export function useLoginHandler() {
  return React.useContext(LoginHandlerContext);
}

export function LoginHandler(props) {
  const { session, setSessionLoading } = useWixSession();
  const [loginState, setLoginState] = React.useState(null);

  const silentLogin = React.useCallback(
    async (sessionToken) => {
      const data = wixCient.auth.generateOAuthData(
        Linking.createURL("/oauth/wix/callback"),
      );
      const { authUrl } = await wixCient.auth.getAuthUrl(data, {
        prompt: "none",
        sessionToken,
      });
      const result = await fetch(authUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (result.status === 400) {
        setSessionLoading(false);
        return Promise.reject(
          "Invalid redirect URI. Please add an allowed URI to your Oauth App",
        );
      }

      setLoginState({
        url: authUrl,
        data,
      });
    },
    [wixCient.auth, setSessionLoading],
  );

  const login = React.useCallback(
    async (email, password) => {
      setSessionLoading(true);
      if (!validator.isEmail(email)) {
        setSessionLoading(false);
        return Promise.reject("Invalid email address!");
      }
      const result = await wixCient.auth.login({
        email,
        password,
      });
      if (!result?.data?.sessionToken) {
        setSessionLoading(false);
        if (result?.loginState === "FAILURE") {
          return Promise.reject("Email address or password is incorrect!");
        }
        return Promise.reject("An error occurred!");
      }
      await silentLogin(result.data.sessionToken);
    },
    [wixCient.auth, setSessionLoading],
  );

  React.useEffect(() => {
    const subscription = Linking.addEventListener("url", async (event) => {
      const url = new URL(event.url);
      const wixMemberLoggedIn = url.searchParams.get("wixMemberLoggedIn");
      const requiresSilentLogin =
        wixMemberLoggedIn === "true" && session.refreshToken.role !== "member";
      if (requiresSilentLogin) {
        silentLogin();
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <LoginHandlerContext.Provider value={{ login }}>
      <LoginHandlerInvisibleWebview
        loginState={loginState}
        setLoginState={setLoginState}
      />
      {props.children}
    </LoginHandlerContext.Provider>
  );
}

function LoginHandlerInvisibleWebview(props) {
  const { setSession } = useWixSession();

  if (!props.loginState) {
    return null;
  } else {
    return (
      <WebView
        source={{ uri: props.loginState.url }}
        originWhitelist={["exp://*", "wixmobileheadless://*"]}
        containerStyle={{ display: "none" }}
        onShouldStartLoadWithRequest={(request) => {
          if (
            request.url.startsWith(Linking.createURL("/oauth/wix/callback"))
          ) {
            const { code, state } = wixCient.auth.parseFromUrl(
              request.url,
              props.loginState.data,
            );
            wixCient.auth
              .getMemberTokens(code, state, props.loginState.data)
              .then((tokens) => {
                setSession(tokens);
                props.setLoginState(null);
              });
            return false;
          }
          return true;
        }}
      />
    );
  }
}

export function useLoginByWixManagedPages() {
  const redirectUri = makeRedirectUri({
    path: "/oauth/wix/callback",
  });

  const { setSession, setSessionLoading } = useWixSession();
  const [error, setError] = React.useState(null);

  const [
    { authorizationEndpoint, sessionToken, used: sessionTokenUsed },
    setAuthorizationEndpoint,
  ] = React.useState({
    authorizationEndpoint: null,
    sessionToken: null,
    used: true,
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_WIX_CLIENT_ID,
      redirectUri,
      scopes: ["offline_access"],
      extraParams: {
        sessionToken,
      },
      usePKCE: true,
      prompt: "login",
    },
    {
      authorizationEndpoint,
      tokenEndpoint: "https://www.wixapis.com/oauth2/token",
    },
  );

  React.useEffect(() => {
    if (!sessionTokenUsed && request?.url.startsWith(authorizationEndpoint)) {
      promptAsync().then(() => {
        setAuthorizationEndpoint({
          authorizationEndpoint: null,
          sessionToken: null,
          used: true,
        });
      });
    }
  }, [sessionTokenUsed, authorizationEndpoint, request?.url]);

  React.useEffect(() => {
    let aborted = false;
    if (response?.type === "success") {
      const { code } = response.params;
      exchangeCodeAsync(
        {
          code,
          clientId: process.env.EXPO_PUBLIC_WIX_CLIENT_ID,
          redirectUri,
          extraParams: {
            code_verifier: request?.codeVerifier,
          },
        },
        {
          tokenEndpoint: "https://www.wixapis.com/oauth2/token",
        },
      )
        .then((response) => {
          if (!aborted) {
            setSession({
              accessToken: {
                value: response.accessToken,
                expiresAt: (response.issuedAt + response.expiresIn) * 1000,
              },
              refreshToken: {
                value: response.refreshToken,
                role: "member",
              },
            });
          }
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setSessionLoading(false);
        });

      return () => {
        aborted = true;
      };
    }
  }, [response]);

  return {
    error,
    openBrowser: async () => {
      const { authorizationEndpoint, sessionToken } =
        await wixCient.auth.getAuthUrl();
      setAuthorizationEndpoint({
        authorizationEndpoint,
        sessionToken,
        used: false,
      });
    },
  };
}
