// =============================================
//  SHEHERLY — CENTRAL CONFIG
//  Change MY_IP to your current machine's IP
//  Run: ipconfig  →  look for IPv4 Address
//  ⚠️  This must match your machine's current
//      local network IPv4 address every time
//      you change networks.
// =============================================

const MY_IP = "10.145.64.89";

// AUTH is handled by Firebase Auth + Firestore — no AUTH_URL needed
export const ADMIN_URL   = `http://${MY_IP}:9000`;   // Admin/Data backend
export const MAP_URL     = `http://${MY_IP}:8002`;   // Map/Route backend
export const CHATBOT_URL = `http://${MY_IP}:8001`;   // Python chatbot backend
export const SEARCH_URL  = `http://${MY_IP}:7000`;   // Search/Suggest backend
