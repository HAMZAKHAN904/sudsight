const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Set the root directory for Expo Router
process.env.EXPO_ROUTER_APP_ROOT = "./app";

module.exports = getDefaultConfig(__dirname);

