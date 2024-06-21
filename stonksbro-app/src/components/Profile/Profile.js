import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import './Profile.css';

import logo_icon from '../Assets/stonksBro-icon.png';
import logout_icon from '../Assets/log-out-outline.png';

import user_icon from '../Assets/person.png';
import portfolio_icon from '../Assets/portfolio.png';
import add_icon from '../Assets/add_friends.png';

import Friends from '../FriendsList/FriendsList';
import Add from '../AddFriends/AddFriends';
import ComingSoon from '../ComingSoon/ComingSoon';

const Profile = () => {
    const navigate = useNavigate();
    const { logout, username, userId } = useAuth();

    const [avatarURL, setAvatarURL] = useState('');
    const presetIcons = ['dog', 'dog_1', 'cat', 'panda', 'rabbit'];
    const [isIconPromptVisible, setIconPromptVisible] = useState(false);
    const [selectedSection, setSelectedSection] = useState('portfolio');
    const [selectedIcon, setSelectedIcon] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const handleGetAvatar = async () => {
            try {
                const response = await fetch(`https://stonks-bro-orbital24-server.vercel.app/get-avatar/${userId}`, { signal });
                if (response.ok) {
                    const data = await response.json();
                    setAvatarURL(data.avatar);
                } else {
                    console.error('Failed to fetch avatar');
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error getting avatar:', error);
                }
            }
        };

        handleGetAvatar();
        return () => controller.abort();
    });

    const onLogout = () => logout();

    const navigateToDashboard = () => navigate('/dashboard');

    const handleIconClick = (icon) => {
        setSelectedIcon(icon);
    };

    const handleChangeAvatar = async () => {
        setIconPromptVisible(false);
        try {
            const response = await fetch('https://stonks-bro-orbital24-server.vercel.app/change-avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    avatar: selectedIcon,
                    userId: userId
                })
            });

            if (response.ok) {
                console.log('Avatar updated successfully');
                const data = await response.text();
                setAvatarURL(data.avatar);
            } else {
                console.error('Failed to change avatar');
            }
        } catch (error) {
            console.error('Error changing avatar:', error);
        }
    };

    const renderBoardContent = () => {
        switch (selectedSection) {
            case 'portfolio':
                return <ComingSoon />;
            case 'friends':
                return <Friends />;
            case 'add':
                return <Add />;
            default:
                return <ComingSoon />;
        }
    };

    return (
        <>
            <div className='header-container'>
                <div className='left-container'>
                    <img className='logo-fixed' src={logo_icon} alt="stonksBro" />
                    <div className='button-group-left'> 
                        <button className="dashboard" onClick={navigateToDashboard}>Dashboard</button>
                        <button className="practice">Practice</button> 
                    </div>
                </div>
                <div className='button-group-right'>
                    <button className='profile'> Profile </button>
                    <button className='logout' onClick={onLogout}>
                        <img className='logout-icon' src={logout_icon} alt='logout-icon' />
                        Logout
                    </button>                   
                </div>
            </div>
            <div className='body-container'>
                <div className='profile-info'>
                    <div className='profile-icon-wrapper'>
                        <img
                            className='profile-icon'
                            src={avatarURL}
                            alt="Avatar"
                            onClick={() => setIconPromptVisible(!isIconPromptVisible)}
                        />
                        {isIconPromptVisible && 
                            <div className='icon-prompt'>
                                {presetIcons.map((icon, index) => (
                                    <img
                                        key={index}
                                        className={`icon-option ${selectedIcon === icon ? 'active' : ''}`}
                                        src={require(`../Assets/avatar/${icon}.png`)}
                                        alt={`icon-${index}`}
                                        onClick={() => handleIconClick(icon)}
                                    />
                                ))}
                                <button className='save-button' onClick={handleChangeAvatar}>
                                    Save
                                </button>
                            </div>
                        }
                    </div>
                    <span className='username'>{username}</span>
                </div>
                <div className='contents'>
                    <div className='side-bar'>
                        <button className={selectedSection === 'portfolio' ? 'active' : ''} onClick={() => setSelectedSection('portfolio')}> 
                            <img className='button-icon' src={portfolio_icon} alt="user_icon" />
                            Portfolio 
                        </button>
                        <button className={selectedSection === 'friends' ? 'active' : ''} onClick={() => setSelectedSection('friends')}> 
                            <img className='button-icon' src={user_icon} alt="user_icon" />
                            Friends 
                        </button>
                        <button className={selectedSection === 'add' ? 'active' : ''} onClick={() => setSelectedSection('add')}> 
                            <img className='button-icon-add' src={add_icon} alt="user_icon" />
                            Add 
                        </button>
                    </div>
                    <div className='board'>
                        {renderBoardContent()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;