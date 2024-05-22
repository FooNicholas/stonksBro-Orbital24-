import React, { useState } from "react";
import './Login.css'
import { useNavigate } from "react-router-dom";

import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import logo_icon from '../Assets/stonksBro-icon.png'

const Login = () => {

    const navigate = useNavigate();
    const navigateToRegister = () => {
    navigate('/Register');
    };


    return (
        <>
            <div className="header-icon">
                <img src={logo_icon} alt="stonksBro"></img>
            </div>
            <div className="container">
                <div className="header">
                    <div className="text"> Login </div>
                    <div className="underline"></div>
                </div>

                <div className="inputs">
                    
                    <div className="input">
                        <img src={email_icon} alt="email_icon" />
                        <input type="email" placeholder="Email" />
                    </div>
                    <div className="input">
                        <img src={password_icon} alt="password_icon" />
                        <input type="password" placeholder="Password"/>
                    </div>
                </div>
                
                <div className="forgot-password"> Lost Password? <span> Click Here!</span> </div>
                
                <div className="submit-container">
                    <div className="submit"> Login </div>
                </div>

                <div className="create-account">                   
                    Don't have an account? <span onClick={navigateToRegister}> Click Here to Register! </span>
                </div>

            </div>

        </>
    )
}

export default Login