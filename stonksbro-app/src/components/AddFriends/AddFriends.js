import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext/AuthContext";
import MessageBox from "../MessageBox/MessageBox";
import "./AddFriends.css";

const AddFriends = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [message, setMessage] = useState("");
    const [friendRequests, setFriendRequests] = useState([]);
    const { userId } = useAuth();

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                const response = await fetch(`https://stonks-bro-orbital24-server.vercel.app/friend-requests/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setFriendRequests(data);
                } else {
                    console.error("Failed to fetch friend requests");
                }
            } catch (error) {
                console.error("Error fetching friend requests:", error);
            }
        };

        fetchFriendRequests();
    }, [userId]);


    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleAccept = async (e, senderId) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://stonks-bro-orbital24-server.vercel.app/accept`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId,
                    senderId: senderId
                })
            });
            if (response.ok) {
                console.log("Success");
                setFriendRequests(prevRequests => prevRequests.filter(request => request.sender_id !== senderId));
            } else {
                console.error("Failed to accept friend request");
            }
        } catch (error) {
            console.error("Error accepting friend requests:", error);
        }
    };
    
    const handleReject = async (e, senderId) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://stonks-bro-orbital24-server.vercel.app/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId,
                    senderId: senderId
                })
            });
    
            if (response.ok) {
                console.log("Success");
                setFriendRequests(prevRequests => prevRequests.filter(request => request.sender_id !== senderId));
            } else {
                console.error("Failed to reject friend request");
            }
        } catch (error) {
            console.error("Error rejecting friend requests:", error);
        }
    };
    

    const handleSendFriendRequest = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("https://stonks-bro-orbital24-server.vercel.app/send-friend-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    senderId: userId,
                    receiverUsername: searchQuery
                })
            });

            if (response.ok) {
                setMessage("Friend request sent successfully.");
                setSearchQuery("");
            } else {
                const errorMessage = await response.text();
                setMessage(errorMessage);
                setSearchQuery("");
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
            setMessage("Error sending friend request.");
            setSearchQuery("");
        }
    };

    return (
        <> 
            <form onSubmit={handleSendFriendRequest} style={{ display: "flex", alignItems: "center" }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search for friends..."
                    className="search-bar"
                />
                <button type="submit" className="send-request"> Send Request </button>
            </form>
            <div className="search-results-container">   
                {friendRequests.length > 0 ? (
                    <ul className="container-ul">
                        {friendRequests.map(request => (
                            <li key={request.id} className="list-item">
                                <div className="info">
                                    <span> Username: {request.sender_username} </span>
                                    <span> Created at: {request.created_at} </span>
                                </div>
                                <div className="button">
                                    <button className="accept-button" onClick={(e) => handleAccept(e, request.sender_id)}> Accept </button>
                                    <button className="reject-button" onClick={(e) => handleReject(e, request.sender_id)}> Reject </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="no-request">No Incoming Friend requests</div>
                )}
            </div>
            <MessageBox message={message} onClose={() => setMessage("")} />
        </>
        
    );
};

export default AddFriends;