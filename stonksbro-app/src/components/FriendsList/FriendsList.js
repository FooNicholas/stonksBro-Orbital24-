import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext/AuthContext";
import "./FriendsList.css";

const Friends = () => {
    const [friends, setFriends] = useState([]);
    const { userId } = useAuth();

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await fetch(`https://stonks-bro-orbital24-server.vercel.app/friends/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setFriends(data);
                    console.log(data);
                } else {
                    console.error("Failed to fetch friends");
                }
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };

        fetchFriends();
    }, [userId]);

    return (
        <div className="friends-container">
            <div className="friend-list">
                {friends.map(friend => (
                    <div className="friend-card" key={friend.id}>
                        {friend.avatar ? (
                            <img src={friend.avatar} alt="Friend" />
                        ) : (
                            <img src="https://via.placeholder.com/200" alt="Placeholder" />
                        )}
                        <h3>{friend.username}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Friends;