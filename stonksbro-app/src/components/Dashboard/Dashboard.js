import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../AuthContext/AuthContext';
import './Dashboard.css';

import logo_icon from '../Assets/stonksBro-icon.png'

const Dashboard = () => {

    const navigate = useNavigate();
    const { logout } = useAuth();

    const onLogout = () => {
        logout();
    };

    const [stocks, setStocks] = useState([]);
    const [portfolio, setPortfolio] = useState([]);
    const [formData, setFormData] = useState({ symbol: '', quantity: '', action: 'buy' });

    useEffect(() => {
        // Fetch stock data (you can replace this with an actual API call)
        setStocks([
            { symbol: 'AAPL', price: 145.09 },
            { symbol: 'GOOGL', price: 2731.60 },
            { symbol: 'AMZN', price: 3342.88 },
        ]);

        // Fetch user portfolio (replace with actual API call)
        setPortfolio([
            { symbol: 'AAPL', quantity: 10 },
            { symbol: 'GOOGL', quantity: 5 },
        ]);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle buy/sell action (you can replace this with an actual API call)
        if (formData.action === 'buy') {
            setPortfolio([...portfolio, { symbol: formData.symbol, quantity: parseInt(formData.quantity) }]);
        } else {
            setPortfolio(portfolio.filter(item => item.symbol !== formData.symbol));
        }
        setFormData({ symbol: '', quantity: '', action: 'buy' });
    };

    return (
        <>
            <div className='header-container'>
                <img className='logo-fixed' src={logo_icon} alt="stonksBro"></img>
                <button className='button-fixed' onClick={onLogout}>Logout</button>
                <button className='profile'> Profile </button>
            </div>
                
            <div className="dashboard">
                <div className="header">Dashboard</div>
                <div className="stock-list">
                    {stocks.map(stock => (
                        <div key={stock.symbol} className="stock-item">
                            <span>{stock.symbol}</span>
                            <span>${stock.price}</span>
                        </div>
                    ))}
                </div>
                <div className="portfolio">
                    <h3>Portfolio</h3>
                    {portfolio.map(item => (
                        <div key={item.symbol} className="stock-item">
                            <span>{item.symbol}</span>
                            <span>{item.quantity} shares</span>
                        </div>
                    ))}
                </div>
                <form className="buy-sell-form" onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        name="symbol" 
                        placeholder="Stock Symbol" 
                        value={formData.symbol} 
                        onChange={handleChange} 
                    />
                    <input 
                        type="number" 
                        name="quantity" 
                        placeholder="Quantity" 
                        value={formData.quantity} 
                        onChange={handleChange} 
                    />
                    <select name="action" value={formData.action} onChange={handleChange}>
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                    </select>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </>
    );
};

export default Dashboard;
