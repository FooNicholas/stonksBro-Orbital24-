import React, { useState } from "react";
import './Login.css'


import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import logo_icon from '../Assets/stonksBro-icon.png'

const Login = () => {

    const [action, setAction] = useState("Register");

    return (
        <>
            <div className="header-icon">
                <img src={logo_icon} alt="stonksBro"></img>
            </div>
            <div className="container">
                <div className="header">
                    <div className="text"> {action} </div>
                    <div className="underline"></div>
                </div>

                <div className="inputs">
                    {action == "Login" 
                    ? <div> </div> 
                    : <div className="input">
                        <img src={user_icon} alt="user_icon" />
                        <input type="text" placeholder="Username"/>
                        </div> 
                    }
                    
                    <div className="input">
                        <img src={email_icon} alt="email_icon" />
                        <input type="email" placeholder="Email" />
                    </div>
                    <div className="input">
                        <img src={password_icon} alt="password_icon" />
                        <input type="password" placeholder="Password"/>
                    </div>
                </div>

                {action == "Register" 
                ?<div></div>
                :<div className="forgot-password"> Lost Password? <span> Click Here!</span> </div>
                }


                <div className="submit-container">
                    <div className={action == "Login" ? "submit" : "submit gray"} onClick={() => {setAction("Register")}}> Register </div>
                    <div className={action == "Register" ? "submit" : "submit gray"} onClick={() => {setAction("Login")}}> Login </div>
                </div>

            </div>
        </>
    )
}

export default Login