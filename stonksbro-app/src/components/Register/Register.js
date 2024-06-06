import './Register.css'
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import MessageBox from '../MessageBox/MessageBox';

import user_icon from '../Assets/person.png'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import logo_icon from '../Assets/stonksBro-icon.png'

const Register = () => {

    const navigate = useNavigate();
    const navigateToLogin = () => {
    navigate('/');
    };

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });

    const [errorMessage, setErrorMessage] = useState('');


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.email || !formData.password || !formData.passwordConfirm) {
            setErrorMessage("All fields are required!");
            return;
        }

        if (formData.password !== formData.passwordConfirm) {
            setErrorMessage("Passwords do not match!");
            return;
        }
    
        try {
            const response = await fetch('https://stonks-bro-orbital24-server.vercel.app/register', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  
                },
                body: JSON.stringify(formData)  
            });
    
            if (response.ok) {
                navigateToLogin();
            } else {
                const errorText = await response.text();
                setErrorMessage(errorText);
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('An error occurred. Please try again.');
        }
    }

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
            <form onSubmit={handleSubmit}>
                <div className="inputs">
                    <div className="input">
                        <img src={user_icon} alt="user_icon" />
                        <input type="text" placeholder="Username" name='username' value={formData.username} onChange={handleChange}/>
                    </div> 
                    
                    <div className="input">
                        <img src={email_icon} alt="email_icon" />
                        <input type="email" placeholder="Email" name='email' value={formData.email} onChange={handleChange}/>
                    </div>
                    <div className="input">
                        <img src={password_icon} alt="password_icon" />
                        <input type="password" placeholder="Password" name='password' value={formData.password} onChange={handleChange}/>
                    </div>
                    <div className="input">
                        <img src={password_icon} alt="password_icon" />
                        <input type="password" placeholder="Confirm Password" name='passwordConfirm' value={formData.passwordConfirm} onChange={handleChange}/>
                    </div>
                </div>

                <div className="submit-container">
                        <button type="submit" className="submit"> Register </button>
                </div>
            </form>

                <div className="login-account"> Already Have an Account? <span onClick={navigateToLogin}>Click Here to Login!</span></div>
             
            </div>
            <MessageBox message={errorMessage} onClose={() => setErrorMessage('')} /> 
        </>
    )
}

export default Register