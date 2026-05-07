process.env.EXPO_ROUTER_APP_ROOT = "app";

module.exports = {
  expo: {
    name: "Subsight",
    slug: "subsight",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "subsight",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "contain",
      backgroundColor: "#06060F",
    },
    ios: {
      supportsTablet: false,
    },
    android: {
      package: "com.hamzapowerplayer.subsight",
    },
    web: {
      favicon: "./assets/images/icon.png",
    },
    plugins: [
      [
        "expo-router",
        {
          origin: "https://replit.com/",
          root: "app",
        },
      ],
      "expo-font",
      "expo-web-browser",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "894c6809-a544-46f2-808d-f5c54573f5e9",
      },
    },
    owner: "dash.com4847",
  },
};
