
import Home from './pages/Home';
import Login from './pages/Login';
import Account from './pages/Account';
import Project from './pages/Project';
import Register from './pages/Register';
import ProtectedRoute from './pages/ProtectedRoute';
import Error from './pages/Error';
import ResetPassword from './pages/ResetPassword';
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/reset" element={<ResetPassword/>}/>
          <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
          <Route path="/account/:uid" element={<ProtectedRoute><Account/></ProtectedRoute>}/>
          <Route path="/project/:id" element={<ProtectedRoute><Project/></ProtectedRoute>}/>


          <Route path="*" element={<Error/>}/>
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
