# stonksBro-Orbital24-

## Stock Trading Web Application

A web-based stock trading simulator built using React, Material-UI, and Node.js. This application allows users to manage their portfolios, trade stocks/crypto, customize their dashboard, follow friends, read financial news, and much more.

## Features

### 1. User Authentication

#### Login Page
Users can log in with the following required fields:
- **Email:** Must be registered and valid.
- **Password:** Must be registered and valid.

#### Registration Page
New users can create an account by providing:
- **Username:** Must be unique and valid.
- **Email:** Must be unique and valid.
- **Password:** At least 8 characters, includes one number, and one special character.
- **Confirm Password:** Must match the password.

#### Reset Password
Users can reset forgotten passwords by entering their registered email address.

### 2. Dashboard

The dashboard has 6 main components:
- **Top bar**
- **Sidebar**
- **Tickers**
- **Graph, Watchlist, and Symbol Details**
- **Top Stories (News)**
- **Recent Transactions**

#### Top Bar
- **Dark/Light Mode Toggle:** Switch between light and dark themes.
- **Notifications:** Displays friend requests.
- **Logout:** Logs the user out.

#### Sidebar
Navigate through the app using the sidebar, with options like:
- **Dashboard**
- **Profile**
- **Friends**
- **News**
- **Trading Simulator**

#### Ticker Customization
Users can customize ticker boxes to track stock symbols of interest. They can input a symbol, change, and save preferences.

#### Recent Transactions
A section displaying the last 10 trading transactions.

### 3. Chart & Watchlist

This component displays a financial chart for selected stocks or cryptos. Users can:
- **View graphs:** Click symbols on the watchlist to update the chart.
- **Add/Remove symbols:** Manage their watchlist by adding or removing symbols.
- **Use drawing tools:** Perform financial analysis using charting tools.

### 4. Friend List

Users can manage their friends list:
- **View Friends:** Display friends and their avatars.
- **Remove Friends:** A pop-up confirmation appears before removal.
- **View Friend Profiles:** Clicking on avatars shows their trades and watchlists.

### 5. News

Users can view financial news related to their watchlist or search for specific stocks/cryptos.
- **Autocomplete Search:** Suggests stock symbols as users type.
- **News Feed:** Clicking a stock symbol retrieves the latest 40 news articles, sorted by relevancy and date.

### 6. Trading Simulator

A virtual stock trading simulator where users can:
- **Trade stocks/cryptos:** Buy and sell assets using virtual currency.
- **View Portfolio:** Displays account balance, positions, profits, and losses.
- **Add Funds:** Users can add virtual currency to their account.

## Technologies Used
- **Frontend:** React, Material-UI, React-router-dom
- **Backend:** Node.js, Supabase
- **APIs:** TradingView, Finnhub
- **Email Service:** Nodemailer with Gmail SMTP
- **Database:** PostgreSQL (via Supabase)
