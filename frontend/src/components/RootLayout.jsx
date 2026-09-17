import React from 'react'
import {Outlet} from 'react-router-dom';
import Navbar from './Navbar';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function RootLayout() {
  return (
    <div>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
