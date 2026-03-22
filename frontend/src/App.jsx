import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import Login from './pages/Login'
import Start from './pages/Start'
import Dashboard from './pages/Dashboard'

const Layout = () => {
  const location = useLocation();
  const hideNav = location.pathname === '/auth' || location.pathname === '/auth/start' || location.pathname === '/dashboard';

  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/auth" element={<Login />} />
        <Route path="/auth/start" element={<Start />} />
        <Route path="/dashboard" element={<Dashboard />} />
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