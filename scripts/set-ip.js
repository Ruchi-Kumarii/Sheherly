/**
 * set-ip.js
 * Detects the current machine's local IPv4 address and updates config.js automatically.
 * Run with: npm run set-ip
 */

const os = require("os");
const fs = require("fs");
const path = require("path");

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip loopback and non-IPv4
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const ip = getLocalIP();

if (!ip) {
  console.error("❌ Could not detect local IP. Are you connected to a network?");
  process.exit(1);
}

const configPath = path.join(__dirname, "..", "config.js");
let content = fs.readFileSync(configPath, "utf8");

// Replace whatever IP is currently set
const updated = content.replace(
  /const MY_IP = "[^"]*";/,
  `const MY_IP = "${ip}";`
);

if (content === updated) {
  console.log("⚠️  No change — config.js may not have MY_IP defined correctly.");
  process.exit(1);
}

fs.writeFileSync(configPath, updated, "utf8");
console.log(`✅ config.js updated → MY_IP = "${ip}"`);
