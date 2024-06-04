import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from '../AuthContext/AuthContext';
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
                    <div className='button-group-left'> 
                        <button class="dashboard">Dashboard</button>
                        <button class="practice">Practice</button> 
                    </div>
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
                <div className='body-left'>
                    <div className='search-bar'>
                    <input type="text" className="search-input" placeholder="Search..."/>
                    </div>
                </div>               
                <div className='body-right'>
                    <div className='body-button-group'>
                        <div className='graph'> Graphs </div>
                        <div className='news'> News </div>
                    </div>                   
                </div>
            </div>
        </>
    );
};

export default Dashboard;
