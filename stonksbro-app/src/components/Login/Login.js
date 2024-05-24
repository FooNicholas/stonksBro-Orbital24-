import './Login.css'
import { useNavigate } from "react-router-dom";

import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import logo_icon from '../Assets/stonksBro-icon.png'

const Login = () => {

    const navigate = useNavigate();
    const navigateToRegister = () => {
    navigate('/register');
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

                <form action="auth/login" method="POST">
                    <div className="inputs">
                        
                        <div className="input">
                            <img src={email_icon} alt="email_icon" />
                            <input type="email" placeholder="Email" id="email" name="email"/>
                        </div>
                        <div className="input">
                            <img src={password_icon} alt="password_icon" />
                            <input type="password" placeholder="Password" id="password" name="password"/>
                        </div>
                    </div>
                    
                    <div className="forgot-password"> Lost Password? <span> Click Here!</span> </div>
                    
                    <div className="submit-container">
                        <button type="submit" className="submit"> Login </button>
                    </div>
                </form>

                <div className="create-account">                   
                    Don't have an account? <span onClick={navigateToRegister}> Click Here to Register! </span>
                </div>

            </div>

        </>
    )
}

export default Login