const fs = require("fs");
const readline = require("readline");

// ---------- INPUT ----------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// ---------- EXTRACT FILE ID ----------
function extractFileId(link) {
  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];

  const alt = link.match(/id=([a-zA-Z0-9_-]+)/);
  if (alt) return alt[1];

  return null;
}

// ---------- MAIN ----------
async function main() {
  const title = await ask("📄 File name: ");
  const link = await ask("🔗 Google Drive link: ");

  const fileId = extractFileId(link);

  if (!fileId) {
    console.log("❌ Could not extract fileId from link.");
    rl.close();
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  const newEntry = `  {
    title: "${title}",
    fileId: "${fileId}",
    date: "${today}"
  }`;

  // ---------- READ FILE ----------
  let content = fs.readFileSync("books.js", "utf-8");

  // insert before last ]
  content = content.replace(/]\s*$/, `,\n${newEntry}\n]`);

  fs.writeFileSync("books.js", content);

  console.log("✅ Book added successfully!");
  rl.close();
}

main();