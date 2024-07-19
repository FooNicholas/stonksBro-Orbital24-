import styles from "./Register.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MessageBox from "../MessageBox/MessageBox";

import { tokens } from "../../theme";
import { useTheme, Box, Typography } from "@mui/material";

import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import logo_icon from "../Assets/stonksBro-icon.png";
import stock_image from "../Assets/stocksimage.jpg";

const Register = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);

  const navigate = useNavigate();
  const navigateToLogin = () => {
    navigate("/");
  };

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.passwordConfirm
    ) {
      setErrorMessage("All fields are required!");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (
      !passwordCriteria.length ||
      !passwordCriteria.number ||
      !passwordCriteria.specialChar ||
      !passwordCriteria.match
    ) {
      setErrorMessage("Please make sure all password requirements are met.");
      return;
    }

    try {
      const response = await fetch(
        "https://stonks-bro-orbital24-server.vercel.app/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        navigateToLogin();
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    number: false,
    specialChar: false,
    match: false,
  });

  useEffect(() => {
    const { password, passwordConfirm } = formData;

    const length = password.length >= 8;
    const number = /\d/.test(password);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const match = password && passwordConfirm && password === passwordConfirm;

    setPasswordCriteria({ length, number, specialChar, match });
  }, [formData, formData.password, formData.passwordConfirm]);

  return (
    <div className="register-container">
      <div className="left-side">
        <img src={stock_image} alt="Stock" className="stock-image" />
      </div>
      <div className="right-side">
        <div className="header-icon">
          <img src={logo_icon} alt="stonksBro" />
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
                <input
                  type="text"
                  placeholder="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

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
              <div className="input">
                <img src={password_icon} alt="password_icon" />
                <input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="input">
                <img src={password_icon} alt="password_icon" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                />
              </div>
              <Box sx={{ ml: 8 }}>
                <Typography
                  fontSize="12px"
                  sx={{
                    color: passwordCriteria.length
                      ? colors.greenAccent[500]
                      : colors.redAccent[500],
                  }}
                >
                  Contains at least 8 characters
                </Typography>
                <Typography
                  fontSize="12px"
                  sx={{
                    color: passwordCriteria.number
                      ? colors.greenAccent[500]
                      : colors.redAccent[500],
                  }}
                >
                  Contains at least one number
                </Typography>
                <Typography
                  fontSize="12px"
                  sx={{
                    color: passwordCriteria.specialChar
                      ? colors.greenAccent[500]
                      : colors.redAccent[500],
                  }}
                >
                  Contains at least one special character
                </Typography>
                <Typography
                  fontSize="12px"
                  sx={{
                    color: passwordCriteria.match
                      ? colors.greenAccent[500]
                      : colors.redAccent[500],
                  }}
                >
                  Password and confirm password match
                </Typography>
              </Box>
            </div>

            <div className="submit-container">
              <button type="submit" className="submit">
                {" "}
                Register{" "}
              </button>
            </div>
          </form>

          <div className="login-account">
            Already Have an Account?{" "}
            <span onClick={navigateToLogin}>Click Here to Login!</span>
          </div>
        </div>
        <MessageBox
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      </div>
    </div>
  );
};

export default Register;
