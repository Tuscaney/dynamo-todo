// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Import global SASS styles (make sure you have src/index.scss)
import './index.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)


