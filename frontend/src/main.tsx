import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'

// Apply global dark theme to root
const rootElement = document.getElementById('root')!
rootElement.style.backgroundColor = '#0f172a'
rootElement.style.backgroundImage = 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)'
rootElement.style.minHeight = '100vh'

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
