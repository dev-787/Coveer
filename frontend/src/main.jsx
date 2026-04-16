import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <App />
          <ToastContainer
            position="bottom-right"
            autoClose={6000}
            hideProgressBar={false}
            theme="dark"
            toastStyle={{
              background: '#16161e',
              border: '1px solid rgba(123,121,196,0.35)',
              color: '#f0f0f2',
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: '0.85rem',
            }}
            progressStyle={{ background: 'linear-gradient(90deg, #5a57b0, #a8aacc)' }}
          />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
