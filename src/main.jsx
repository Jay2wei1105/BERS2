import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Provide the globals expected by ddd.jsx if env vars are set.
const firebaseConfig = import.meta.env.VITE_FIREBASE_CONFIG
const appId = import.meta.env.VITE_APP_ID
const initialAuthToken = import.meta.env.VITE_INITIAL_AUTH_TOKEN

if (firebaseConfig) {
  window.__firebase_config = firebaseConfig
}

if (appId) {
  window.__app_id = appId
}

if (initialAuthToken) {
  window.__initial_auth_token = initialAuthToken
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
