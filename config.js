// =============================================
//  SHEHERLY — CENTRAL CONFIG
//  MAP_URL, CHATBOT_URL, SEARCH_URL still use
//  local IP — update MY_IP when running locally.
//  Run: ipconfig  →  look for IPv4 Address
// =============================================

const MY_IP = "10.145.64.89";

// AUTH is handled by Firebase Auth + Firestore — no AUTH_URL needed
export const ADMIN_URL   = "https://sheherly-admin-api.onrender.com";  // ✅ Deployed on Render
export const MAP_URL     = `http://${MY_IP}:8002`;   // Map/Route backend (local)
export const CHATBOT_URL = `http://${MY_IP}:8001`;   // Python chatbot backend (local)
export const SEARCH_URL  = `http://${MY_IP}:7000`;   // Search/Suggest backend (local)
