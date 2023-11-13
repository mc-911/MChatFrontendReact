import React from 'react';
import logo from './logo.svg';
import "./Components/css/style.css"
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Welcome from './Components/welcome';
import Registration from './Components/registration';
import Home from './Components/home';
import axios from 'axios'
import PrivateRoutes from './Components/protectedRoute';

axios.defaults.withCredentials = true

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome/>} />
      <Route path='/registration' element={<Registration/>} />
      <Route element={<PrivateRoutes/>}>
      <Route path='/home' element={<Home/>} />
      </Route>
    </Routes>
  );
}

export default App;
