import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext/AuthContext';
import TradingViewDashboard from '../TradingViewWidget/TradingViewDashboard/TradingViewDashboard';
import styles from './Dashboard.module.css'

import logo_icon from '../Assets/stonksBro-icon.png'
import logout_icon from '../Assets/log-out-outline.png'



const Dashboard = () => {

    const navigate = useNavigate();
    const { logout } = useAuth();

    const onLogout = () => {
        logout();
    };

    const navgivateToProfile = () => {
        navigate('/profile')
    }

    return (
        <>
            <div className={styles.headerContainer}>
                <div className={styles.leftContainer}>
                    <img className={styles.logoFixed} src={logo_icon} alt="stonksBro"></img>
                    <div className={styles.buttonGroupLeft}> 
                        <button className={styles.dashboard}>Dashboard</button>
                        <button className={styles.practice}>Practice</button> 
                    </div>
                </div>
                <div className={styles.buttonGroupRight}>
                    <button className={styles.profile} onClick={navgivateToProfile}> Profile </button>
                    <button className={styles.logout} onClick={onLogout}>
                        <img className={styles.logoutIcon} src={logout_icon} alt='logout-icon'></img>
                        Logout
                    </button>                   
                </div>
            </div>
            <div className={styles.bodyContainer}>
                <div className={styles.bodyLeft}>
                    <div className={styles.searchBar}>
                        <input type="text" className={styles.searchInput} placeholder="Search..."/>
                    </div>
                </div>               
                <div className={styles.bodyRight}>
                    <div className={styles.bodyButtonGroup}>
                        <div className={styles.graph}> Graphs </div>
                        <div className={styles.news}> News </div>
                    </div>                   
                </div>
            </div>
        </>
    );
};


export default Dashboard;
