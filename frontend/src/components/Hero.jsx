import React, { useContext } from 'react';
import {AuthContext} from '../context/AuthContext';
import heroBg from '../assets/hero-bg.jpg'; // import image properly

function Hero() {
  const { user } = useContext(AuthContext);

  return (
    <div
      className="hero-section d-flex align-items-center m-2 shadow-3 rounded rounded-5 justify-content-center text-white"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '60vh'
      }}
    >
      <h1 className="fw-bold text-dark ">Welcome Back! {user.name}</h1>
    </div>
  );
}

export default Hero;