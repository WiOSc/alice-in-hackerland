const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'node_modules', 'react-tetris', 'lib', 'models', 'Game.js');

if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  // Replaces the initial lines from 0 to 30 so the game starts at Level 4
  content = content.replace(/lines:\s*0\s*,/g, 'lines: 30,');
  content = content.replace(/lines:\s*50\s*,/g, 'lines: 30,'); // In case it was already patched to 50
  fs.writeFileSync(file, content);
  console.log('Successfully patched react-tetris to start at Level 4.');
} else {
  console.warn('react-tetris Game.js not found, skipping patch.');
}
