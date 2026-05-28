const ts = require('typescript');
const fs = require('fs');

const fileName = 'd:\\VEDA AI\\frontend\\src\\app\\assignment\\[id]\\page.tsx';
const fileContent = fs.readFileSync(fileName, 'utf8');

const result = ts.transpileModule(fileContent, {
  compilerOptions: { 
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2020 
  },
  reportDiagnostics: true
});

console.log("TypeScript Transpilation Diagnostics:");
if (result.diagnostics && result.diagnostics.length > 0) {
  result.diagnostics.forEach(diag => {
    const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
    if (diag.file) {
      let { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
      console.log(`Error at ${diag.file.fileName} (${line + 1}:${character + 1}): ${message}`);
    } else {
      console.log(`Error: ${message}`);
    }
  });
} else {
  console.log("No diagnostics found! Transpilation succeeded.");
}
