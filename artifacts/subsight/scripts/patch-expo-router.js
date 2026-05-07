const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'node_modules/expo-router/_ctx.android.js',
  'node_modules/expo-router/_ctx.ios.js',
  'node_modules/expo-router/_ctx.js',
  'node_modules/expo-router/_ctx.web.js',
  'node_modules/expo-router/_ctx-shared.js'
];

filesToPatch.forEach(file => {
  const localPath = path.join(__dirname, '..', file);
  const rootPath = path.join(__dirname, '..', '..', '..', file);
  
  [localPath, rootPath].forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('process.env.EXPO_ROUTER_APP_ROOT')) {
        content = content.replace(/process\.env\.EXPO_ROUTER_APP_ROOT/g, '"app"');
        content = content.replace(/process\.env\.EXPO_ROUTER_IMPORT_MODE/g, '"sync"');
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath}`);
      }
    }
  });
});
