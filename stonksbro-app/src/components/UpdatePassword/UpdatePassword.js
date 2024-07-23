import "./UpdatePassword.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MessageBox from "../MessageBox/MessageBox";

import { tokens } from "../../theme";
import { useTheme, Box, Typography } from "@mui/material";

import password_icon from "../Assets/password.png";
import logo_icon from "../Assets/stonksBro-icon.png";
import stock_image from "../Assets/stocksimage.jpg";

const UpdatePassword = () => {
  const colorTheme = useTheme();
  const colors = tokens(colorTheme.palette.mode);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const [formData, setFormData] = useState({
    password: "",
    passwordConfirm: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.passwordConfirm) {
      setErrorMessage("Please enter and confirm your new password.");
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
        "https://stonks-bro-orbital24-server.vercel.app/update-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            newPassword: formData.password,
          }),
        }
      );

      if (response.ok) {
        setSuccessMessage("Password updated successfully.");
        setErrorMessage("");
        navigate("/");
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
    <div className="update-container">
      <div className="left-side">
        <img src={stock_image} alt="Stock" className="stock-image" />
      </div>
      <div className="right-side">
        <div className="header-icon">
          <img src={logo_icon} alt="stonksBro" />
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
                Submit
              </button>
            </div>
          </form>

          <div className="back">
            Go back? <span onClick={() => navigate("/")}>Click Here!</span>
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

export default UpdatePassword;
