import './UpdatePassword.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import MessageBox from '../MessageBox/MessageBox';

import password_icon from '../Assets/password.png';
import logo_icon from '../Assets/stonksBro-icon.png';

const UpdatePassword = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      setErrorMessage('Access token not found.');
    }
  }, [location.search]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!formData.password || !formData.passwordConfirm) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get('access_token');

    try {
      const response = await fetch('http://localhost:5000/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ password: formData.password }),
      });

      if (response.ok) {
        setSuccessMessage('Password updated successfully.');
        setErrorMessage('');
        navigate('/');
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText);
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <>
      <div className="header-icon">
        <img src={logo_icon} alt="stonksBro"></img>
      </div>
      <div className="container">
        <div className="header">
          <div className="text"> Update Password </div>
          <div className="underline"></div>
        </div>

        <form onSubmit={handleUpdatePassword}>
          <div className="inputs">
            <div className="input">
              <img src={password_icon} alt="password_icon" />
              <input 
                type="password" 
                placeholder="New Password"
                name="password" 
                value={formData.password}
                onChange={handleChange}/>
            </div>
            <div className="input">
              <img src={password_icon} alt="password_icon" />
              <input 
                type="password"
                placeholder="Confirm Password"
                name="passwordConfirm" 
                value={formData.passwordConfirm}
                onChange={handleChange}/>
            </div>
          </div>
          
          <div className="submit-container">
            <button type="submit" className="submit"> Update Password </button>
          </div>
        </form>

        <div className="create-account">                   
          Go back? <span onClick={() => navigate('/')}> Click Here! </span>
        </div>
      </div>
      {errorMessage && <MessageBox message={errorMessage} onClose={() => setErrorMessage('')} />}
      {successMessage && <MessageBox message={successMessage} onClose={() => setSuccessMessage('')} />}
    </>
  )
}

export default UpdatePassword;
