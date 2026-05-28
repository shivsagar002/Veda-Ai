const fs = require('fs');

const code = fs.readFileSync('d:\\VEDA AI\\frontend\\src\\app\\assignment\\[id]\\page.tsx', 'utf8');

function checkTags(code) {
  let lines = code.split('\n');
  let openTags = [];
  let inJSX = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Simple regex to find JSX tags on this line
    let matches = line.matchAll(/<(\/?[a-zA-Z0-9_.-]+)(?:\s|>|\/)/g);
    for (let match of matches) {
      let tag = match[1];
      if (tag.startsWith('/') || line.includes('/>')) {
        // Closing tag or self-closing
        let closing = tag.startsWith('/') ? tag.substring(1) : tag;
        console.log(`Line ${i + 1}: Closing ${closing}`);
      } else {
        console.log(`Line ${i + 1}: Opening ${tag}`);
      }
    }
  }
}

// Let's use standard Esprima or just check brace balance
let openBraces = 0;
let openParens = 0;
let openJSX = 0;

console.log("File loaded. Length:", code.length);
