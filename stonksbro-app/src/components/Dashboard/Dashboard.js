import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from '../AuthContext/AuthContext';
import TradingViewDashboard from '../TradingViewWidget/TradingViewDashboard/TradingViewDashboard';
import './Dashboard.css';

import logo_icon from '../Assets/stonksBro-icon.png'
import logout_icon from '../Assets/log-out-outline.png'



const Dashboard = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const onLogout = () => {
        logout();
    };

    return (
        <>
            <div className='header-container'>
                <div class='left-container'>
                    <img className='logo-fixed' src={logo_icon} alt="stonksBro"></img>
                </div>
                <div className='button-group-right'>
                    <button className='profile'> Profile </button>
                    <button className='logout' onClick={onLogout}>
                        <img className='logout-icon' src={logout_icon} alt='logout-icon'></img>
                        Logout
                    </button>                   
                </div>
            </div>
            <div className='body-container'>
                <TradingViewDashboard />
            </div>
        </>
    );
};

export default Dashboard;
