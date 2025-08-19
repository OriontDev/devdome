
import Home from './pages/Home';
import Login from './pages/Login';
import Account from './pages/Account';
import Project from './pages/Project';
import { HashRouter, Routes, Route } from "react-router-dom";

function App() {

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/account" element={<Account/>}/>
          <Route path="/project/:id" element={<Project/>}/>

        </Routes>
      </HashRouter>
    </>
  )
}

export default App
