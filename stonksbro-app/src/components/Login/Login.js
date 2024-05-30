import './Login.css'
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import logo_icon from '../Assets/stonksBro-icon.png'

const Login = () => {

    const navigate = useNavigate();
    const navigateToRegister = () => {
        navigate('/register');
    };
    const navigateToDashboard = () => {
        navigate('/dashboard');
    }

    const [formData, setFormData] = useState({
        email: '',
        password: '',
      });
      const [error, setError] = useState('');
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
          try {
            const response = await fetch('https://stonks-bro-orbital24-server.vercel.app/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
            });
    
            if (response.ok) {
              console.log('Login successful');
              navigate('/dashboard');
            } else {
              const errorText = await response.text();
              setError(errorText);
            }
          } catch (error) {
            setError('Server error. Please try again later.');
          }
        }
      };
    
      const validateForm = () => {
        if (!formData.email || !formData.password) {
          setError('Email and password are required.');
          return false;
        }
        setError('');
        return true;
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

                <form onSubmit={handleSubmit}>
                    <div className="inputs">
                        
                        <div className="input">
                            <img src={email_icon} alt="email_icon" />
                            <input 
                                type="email" 
                                placeholder="Email"
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}/>
                        </div>
                        <div className="input">
                            <img src={password_icon} alt="password_icon" />
                            <input 
                                type="password"
                                placeholder="Password"
                                name="password" 
                                value={formData.password}
                                onChange={handleChange}/>
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