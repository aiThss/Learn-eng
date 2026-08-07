/**
 * Main Entry Point - EnglishUp
 * Setup React 18 + Router + Theme
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Đặt title page
document.title = 'EnglishUp - Học tiếng Anh thông minh'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
