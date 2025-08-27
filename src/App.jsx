import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Login';
import Account from './pages/Account';
import Project from './pages/Project';
import Register from './pages/Register';
import ProtectedRoute from './pages/ProtectedRoute';
import Error from './pages/Error';
import ResetPassword from './pages/ResetPassword';
import Post from './pages/Post';
import Header from './components/Header/Header';

function AppWrapper() {
  const location = useLocation();
  const hideHeaderRoutes = ['/', '/register', '/reset']; // routes where header is hidden
  const showHeader = !hideHeaderRoutes.includes(location.pathname); //return true if the current path does NOT contain hideheaderroutes

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/account/:uid" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><Project /></ProtectedRoute>} />
        <Route path="/post/:id" element={<ProtectedRoute><Post /></ProtectedRoute>} />
        <Route path="*" element={<Error />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppWrapper />
    </HashRouter>
  );
}

export default App;
