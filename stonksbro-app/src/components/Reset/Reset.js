import "./Reset.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MessageBox from "../MessageBox/MessageBox";

import email_icon from "../Assets/email.png";
import logo_icon from "../Assets/stonksBro-icon.png";
import stock_image from "../Assets/stocksimage.jpg";

const Reset = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const navigateToLogin = () => {
    navigate("/");
  };

  const [formData, setFormData] = useState({
    email: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    try {
      const response = await fetch(
        "https://stonks-bro-orbital24-server.vercel.app/reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setSuccessMessage("Password reset email sent.");
        setErrorMessage("");
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText);
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred. Please try again.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="reset-container">
      <div className="left-side">
        <img src={stock_image} alt="Stock" className="stock-image" />
      </div>
      <div className="right-side">
        <div className="header-icon">
          <img src={logo_icon} alt="stonksBro" />
        </div>
        <div className="container">
          <div className="header">
            <div className="text">Reset Password</div>
            <div className="underline"></div>
          </div>

          <form onSubmit={handlePasswordReset}>
            <div className="inputs">
              <div className="input">
                <img src={email_icon} alt="email_icon" />
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="submit-container">
              <button type="submit" className="submit">
                Reset Password
              </button>
            </div>
          </form>

          <div className="back">
            Go back? <span onClick={navigateToLogin}>Click Here!</span>
          </div>
        </div>
        {errorMessage && (
          <MessageBox
            message={errorMessage}
            onClose={() => setErrorMessage("")}
          />
        )}
        {successMessage && (
          <MessageBox
            message={successMessage}
            onClose={() => setSuccessMessage("")}
          />
        )}
      </div>
    </div>
  );
};

export default Reset;
