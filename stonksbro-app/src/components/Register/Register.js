import './Register.css'
import { useNavigate } from "react-router-dom";

import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import logo_icon from '../Assets/stonksBro-icon.png'

const Register = () => {

    const navigate = useNavigate();
    const navigateToLogin = () => {
    navigate('/');
    };

    return (
        <>
            <div className="header-icon">
                <img src={logo_icon} alt="stonksBro"></img>
            </div>
            <div className="container">
                <div className="header">
                    <div className="text"> Register </div>
                    <div className="underline"></div>
                </div>
            <form action="auth/register" method="POST">
                <div className="inputs">
                    <div className="input">
                        <img src={user_icon} alt="user_icon" />
                        <input type="text" placeholder="Username" id='Username' name='username'/>
                    </div> 
                    
                    <div className="input">
                        <img src={email_icon} alt="email_icon" />
                        <input type="email" placeholder="Email" id='email' name='email'/>
                    </div>
                    <div className="input">
                        <img src={password_icon} alt="password_icon" />
                        <input type="password" placeholder="Password" id='password' name='password'/>
                    </div>
                    <div className="input">
                        <img src={password_icon} alt="password_icon" />
                        <input type="password" placeholder="Confirm Password" id='passwordConfirm' name='passwordConfirm'/>
                    </div>
                </div>

                <div className="submit-container">
                        <button type="submit" className="submit"> Register </button>
                </div>
            </form>

                <div className="login-account"> Already Have an Account? <span onClick={navigateToLogin}>Click Here to Login!</span></div>

                
            </div>
        </>
    )
}

export default Register