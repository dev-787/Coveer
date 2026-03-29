import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Navbar } from './components/Navbar'
import Login from './pages/Login'
import Start from './pages/Start'
import Dashboard from './pages/Dashboard'
import Verify from './pages/Verify'

const Layout = () => {
  const location = useLocation();
  const hideNav = location.pathname === '/auth' || location.pathname === '/auth/start' || location.pathname === '/dashboard' || location.pathname === '/verify';

  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<><Hero /><HowItWorks /></>} />
        <Route path="/auth" element={<Login />} />
        <Route path="/auth/start" element={<Start />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verify"    element={<Verify />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
}


export default App