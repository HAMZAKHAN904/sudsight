process.env.EXPO_ROUTER_APP_ROOT = "./app";
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { unstable_transformImportMeta: true, routerRoot: "./app" }],
    ],
    plugins: [
      "babel-plugin-react-compiler",
      "react-native-reanimated/plugin",
    ],
  };
};
