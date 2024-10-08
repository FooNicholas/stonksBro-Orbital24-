require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const nodemailer = require("nodemailer");
const finnhub = require("finnhub");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, "stonksbro-app", "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const api_key = finnhub.ApiClient.instance.authentications["api_key"];
api_key.apiKey = process.env.FINNHUB_API_KEY;
const finnhubClient = new finnhub.DefaultApi();

const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseURL, supabaseKey);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADD,
    pass: process.env.APP_PW,
  },
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  const { data: users, error } = await supabase
    .from("users")
    .select()
    .eq("email", email);

  if (error) {
    return res.status(500).send("Server error.");
  }

  if (users.length === 0) {
    return res.status(401).send("Invalid email or password.");
  }

  const user = users[0];
  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

  if (isPasswordValid) {
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, username: user.username, userId: user.id });
  } else {
    res.status(401).send("Invalid email or password.");
  }
});

app.post("/register", async (req, res) => {
  const { username, email, password, passwordConfirm } = req.body;

  if (!username || !email || !password || !passwordConfirm) {
    return res.status(400).send("All fields are required.");
  }

  if (password !== passwordConfirm) {
    return res.status(400).send("Passwords do not match.");
  }

  const { data: existingUsers, error: existingUsersError } = await supabase
    .from("users")
    .select()
    .or(`email.eq.${email},username.eq.${username}`);

  if (existingUsersError) {
    console.error("Supabase error:", existingUsersError.message);
    return res.status(500).send("Internal server error.");
  }

  if (existingUsers.length > 0) {
    if (existingUsers.some((user) => user.email === email)) {
      return res.status(400).send("Email is already registered.");
    }
    if (existingUsers.some((user) => user.username === username)) {
      return res.status(400).send("Username is already taken.");
    }
  }

  let hashedPassword = await bcrypt.hash(password, 10);

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert([{ username, email, hashedPassword }]);

  if (insertError) {
    console.error("Supabase error:", insertError.message);
    return res.status(500).send("Internal server error.");
  }

  res.status(200).send("Registration successful");
});

app.post("/reset", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send("Email is required.");
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (userError) {
    console.error("Supabase error:", userError.message);
    return res.status(404).send("User not found");
  }

  const resetToken = require("crypto").randomBytes(20).toString("hex");
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1); // 1 hour expiration

  const { error: tokenError } = await supabase
    .from("users")
    .update({ reset_token: resetToken, reset_token_expiration: expiration })
    .eq("id", user.id);

  if (tokenError) {
    console.error("Supabase error:", tokenError.message);
    return res.status(500).send("Internal server error.");
  }

  const resetURL = `https://stonks-bro-orbital24.vercel.app/update-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_ADD,
    to: email,
    subject: "Password Reset",
    html: `
    <p>You requested a password reset.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).send("Error sending email.");
    }
    res.status(200).send("Password reset email sent.");
  });
});

app.post("/update-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).send("Token and new password are required.");
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, reset_token_expiration")
    .eq("reset_token", token)
    .single();

  if (userError || !user) {
    console.error(
      "Supabase error:",
      userError ? userError.message : "User not found"
    );
    return res.status(400).send("Invalid or expired token.");
  }

  const now = new Date();
  if (now > new Date(user.reset_token_expiration)) {
    return res.status(400).send("Token has expired.");
  }

  let hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from("users")
    .update({
      hashedPassword: hashedPassword,
      reset_token: null,
      reset_token_expiration: null,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Supabase error:", updateError.message);
    return res.status(500).send("Internal server error.");
  }

  res.status(200).send("Password updated successfully.");
});

app.post("/send-friend-request", async (req, res) => {
  const { senderId, receiverUsername } = req.body;

  if (!senderId || !receiverUsername) {
    return res
      .status(400)
      .send("Sender ID and receiver username are required.");
  }

  const { data: receiver, error: receiverError } = await supabase
    .from("users")
    .select("id")
    .eq("username", receiverUsername)
    .single();

  if (receiverError || !receiver) {
    return res.status(404).send("User not found.");
  }

  const { data: multipleRequest, error: multipleRequestError } = await supabase
    .from("friend_request")
    .select()
    .match({ sender_id: senderId, receiver_id: receiver.id });

  if (multipleRequest.length > 0) {
    return res
      .status(200)
      .send("You have already sent a request to this account.");
  }

  if (multipleRequestError) {
    console.error("Supabase error:", multipleRequestError.message);
    return res.status(500).send("Internal server error.");
  }

  const { data: alreadyFriends, error: alreadyFriendsError } = await supabase
    .from("friends")
    .select()
    .match({ user_id: senderId, friends_id: receiver.id });

  if (alreadyFriends.length > 0) {
    return res.status(200).send("You are already friends with this account");
  }

  if (alreadyFriendsError) {
    console.error("Supabase error:", alreadyFriendsError.message);
    return res.status(500).send("Internal server error.");
  }

  const date = new Date();

  const { error: insertError } = await supabase
    .from("friend_request")
    .insert([
      { sender_id: senderId, receiver_id: receiver.id, created_at: date },
    ]);

  if (insertError) {
    console.error("Supabase error:", insertError.message);
    return res.status(500).send("Internal server error.");
  } else {
    res.status(200).send("Friend request sent successfully.");
  }
});

app.get("/friend-requests/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch friend requests
    const { data: requests, error } = await supabase
      .from("friend_request")
      .select("id, sender_id, created_at")
      .eq("receiver_id", userId);

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).send("Internal server error.");
    }

    // Check if there are no requests
    if (requests.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch usernames based on sender_ids
    const senderIds = requests.map((request) => request.sender_id);
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username")
      .in("id", senderIds);

    if (usersError) {
      console.error("Supabase error:", usersError.message);
      return res.status(500).send("Internal server error.");
    }

    // Map usernames to friend requests
    const requestsWithUsernames = requests.map((request) => {
      const sender = users.find((user) => user.id === request.sender_id);
      return {
        ...request,
        sender_username: sender ? sender.username : "Unknown",
      };
    });

    res.status(200).json(requestsWithUsernames);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/accept", async (req, res) => {
  const { userId, senderId } = req.body;

  try {
    const { data: addFriend, error: addFriendError } = await supabase
      .from("friends")
      .insert([
        { user_id: userId, friends_id: senderId },
        { user_id: senderId, friends_id: userId },
      ]);

    if (addFriendError) {
      console.error("Error inserting into friends table:", addFriendError);
      return res.status(500).send("Internal server error.");
    }

    const { data: deleteRequest, error: deleteRequestError } = await supabase
      .from("friend_request")
      .delete()
      .match({ receiver_id: userId, sender_id: senderId });

    if (deleteRequestError) {
      console.error(
        "Error deleting from friend_request table:",
        deleteRequestError
      );
      return res.status(500).send("Internal server error.");
    }

    res.status(200).send("Friend request accepted successfully.");
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/reject", async (req, res) => {
  const { userId, senderId } = req.body;

  if (!userId || !senderId) {
    return res.status(400).send("User ID and Sender ID are required.");
  }

  try {
    const { data: deleteRequest, error: deleteRequestError } = await supabase
      .from("friend_request")
      .delete()
      .match({ receiver_id: userId, sender_id: senderId });

    if (deleteRequestError) {
      console.error(
        "Error deleting from friend_request table:",
        deleteRequestError
      );
      return res.status(500).send("Internal server error.");
    }

    res.status(200).send("Friend request rejected successfully.");
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/friends/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: friends, error } = await supabase
      .from("friends")
      .select("friends_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).send("Internal server error.");
    }

    const friend_id = friends.map((request) => request.friends_id);
    const { data: friendDetails, error: friendDetailsError } = await supabase
      .from("users")
      .select("id, username, avatar")
      .in("id", friend_id);

    if (friendDetailsError) {
      console.error("Supabase error:", friendDetailsError.message);
      return res.status(500).send("Internal server error.");
    }

    res.status(200).json(friendDetails);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/remove-friend", async (req, res) => {
  const { userId, friendId } = req.body;

  try {
    const { error: error1 } = await supabase
      .from("friends")
      .delete()
      .match({ user_id: userId, friends_id: friendId });

    if (error1) {
      console.error("Supabase error:", error1.message);
      return res.status(500).send("Internal server error.");
    }

    const { error: error2 } = await supabase
      .from("friends")
      .delete()
      .match({ user_id: friendId, friends_id: userId });

    if (error2) {
      console.error("Supabase error:", error2.message);
      return res.status(500).send("Internal server error.");
    }

    res.status(200).send("Friend deleted from friends list succesfully.");
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/get-avatar/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { data: avatar, error } = await supabase
      .from("users")
      .select("avatar")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).send("Internal server error.");
    }

    res.status(200).json(avatar);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/change-avatar", async (req, res) => {
  const { avatar, userId } = req.body;

  try {
    const { data: icon, error: retrieveIconError } = supabase.storage
      .from("profile_icon")
      .getPublicUrl(avatar);

    if (retrieveIconError) {
      console.error("Supabase error:", retrieveIconError.message);
      return res.status(500).send("Internal server error.");
    }

    const { data: updateIcon, error: updateIconError } = await supabase
      .from("users")
      .update({ avatar: icon.publicUrl })
      .eq("id", userId);

    if (updateIconError) {
      console.error("Supabase error:", updateIconError.message);
      return res.status(500).send("Internal server error.");
    }

    res.status(200).send("Avatar updated successfully.");
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/watchlist/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: watchlistData, error: fetchWatchlistError } = await supabase
      .from("users")
      .select("watchlist")
      .eq("id", userId)
      .single();

    if (fetchWatchlistError) {
      console.error("Supabase error:", fetchWatchlistError.message);
      return res.status(500).send("Internal server error.");
    }

    res.status(200).json(watchlistData.watchlist);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/add-symbol", async (req, res) => {
  const { userId, newWatchlist } = req.body;

  try {
    const { data: updateWatchlist, error: updateWatchlistError } =
      await supabase
        .from("users")
        .update({ watchlist: newWatchlist })
        .eq("id", userId);

    if (updateWatchlistError) {
      console.error("Supabase error:", updateWatchlistError.message);
      return res.status(500).send("Internal server error.");
    }
    res.status(200).send("Successfully added symbol to watchlist");
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/remove-symbol", async (req, res) => {
  const { userId, newWatchlist } = req.body;

  try {
    const { data: updateWatchlist, error: updateWatchlistError } =
      await supabase
        .from("users")
        .update({ watchlist: newWatchlist })
        .eq("id", userId);

    if (updateWatchlistError) {
      console.error("Supabase error:", updateWatchlistError.message);
      return res.status(500).send("Internal server error.");
    }
    res.status(200).send("Successfully added symbol to watchlist");
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/ticker/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: tickers, error: fetchTickerError } = await supabase
      .from("users")
      .select("ticker")
      .eq("id", userId)
      .single();

    if (fetchTickerError) {
      console.error("Supabase error:", fetchTickerError.message);
      return res.status(500).send("Internal server error.");
    }

    res.status(200).json(tickers.ticker);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/update-ticker", async (req, res) => {
  const { userId, symbols } = req.body;

  try {
    const { data: tickersData, error: fetchTickerError } = await supabase
      .from("users")
      .update({ ticker: symbols })
      .eq("id", userId);

    if (fetchTickerError) {
      console.error("Supabase error:", fetchTickerError.message);
      return res.status(500).send("Internal server error.");
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/add-balance", async (req, res) => {
  const { userId, newBalance } = req.body;

  try {
    const { error } = await supabase
      .from("users")
      .update({ balance: parseFloat(newBalance) })
      .eq("id", userId);

    if (error) {
      console.error("Error adding balance:", error.message);
      return res.status(500).send("Error adding balance:");
    }
    return res.status(200).send("Successfully added balance");
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/api/stock/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    finnhubClient.quote(symbol, (error, data, response) => {
      if (error) {
        console.error("Error fetching data from Finnhub:", error);
        return res.status(500).json({ error: "Error fetching data" });
      }

      var currentValue = data.c; // Current price

      if (currentValue === undefined) {
        console.error("Invalid response data:", data);
        return res.status(500).json({ error: "Invalid response from Finnhub" });
      }

      res.json({ symbol, currentValue });
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/api/buy/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const { userId, position, held } = req.body;

  try {
    let currentValue;
    await new Promise((resolve, reject) => {
      finnhubClient.quote(symbol, (error, data, response) => {
        if (error) {
          console.error("Error fetching data from Finnhub:", error);
          return reject("Error fetching data");
        }

        if (data.c === undefined) {
          console.error("Invalid response data:", data);
          return reject("Invalid response from Finnhub");
        } else {
          currentValue = data.c; // Current price
          resolve();
        }
      });
    });

    let { data: portfolio, error } = await supabase
      .from("users")
      .select("trades, balance")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching portfolio:", error.message);
      return res.status(500).json({ error: "Error fetching portfolio" });
    }

    let trades = portfolio.trades || []; //updating the portfolio
    trades.push({
      symbol: symbol,
      position: position,
      held: parseFloat(held),
      boughtAt: parseFloat(currentValue),
    });

    let tradecost = parseFloat(held * currentValue);

    if (tradecost > portfolio.balance) {
      return res.status(400).json({
        error: "You balance is insufficient",
        tradecost: tradecost,
        balance: portfolio.balance,
      });
    }

    const newBalance = parseFloat(portfolio.balance - tradecost);

    const { error: updateError } = await supabase
      .from("users")
      .update({ trades: trades, balance: parseFloat(newBalance) })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating portfolio:", updateError.message);
      return res.status(500).json({ error: "Error updating portfolio" });
    }

    res.status(200).json({
      message: "Trade executed successfully",
      trades: trades,
      newBalance: newBalance,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/portfolio/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: fetchPortfolio, error: fetchPortfolioError } = await supabase
      .from("users")
      .select("trades, balance")
      .eq("id", userId);

    if (fetchPortfolioError) {
      console.error("Supabase error:", fetchPortfolioError.message);
      return res.status(500).send("Internal server error.");
    }

    res.status(200).json(fetchPortfolio);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/portfolio/:userId", async (req, res) => {
  const { userId } = req.params;
  const { portfolio } = req.body;

  try {
    const { error } = await supabase
    .from("users")
    .update({trades: portfolio})
    .eq("id", userId)

    if (error) {
      console.error("Supabase error:", fetchPortfolioError.message);
      return res.status(500).send("Internal server error.");
    }

    res.status(200).send("Successfully updated portfolio");
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/sell/:userId", async (req, res) => {
  const { userId } = req.params;
  const { updatedPortfolio, newAccountBalance } = req.body;

  try {
    const { error: updatePortfolioError } = await supabase
      .from("users")
      .update({ trades: updatedPortfolio, balance: newAccountBalance })
      .eq("id", userId);

    if (updatePortfolioError) {
      console.error("Error updating portfolio:", updatePortfolioError.message);
      return res.status(500).json({ error: "Error updating portfolio" });
    }

    const { data: fetchBalance, error: fetchBalanceError } = await supabase
      .from("users")
      .select("balance")
      .eq("id", userId);

    if (fetchBalanceError) {
      console.error("Supabase error:", fetchBalanceError.message);
      return res.status(500).send("Internal server error.");
    }

    res.status(200).json(fetchBalance);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/friend-profile/:friendId", async (req, res) => {
  const { friendId } = req.params;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("username, avatar, ticker, watchlist, trades")
      .eq("id", friendId);

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(500).send("Internal server error.");
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/news/:symbol", async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${NEWSAPI_KEY}`
    );
    if (response.ok) {
      const data = await response.json();
      const news = data.articles;
      res.status(200).send(news.slice(0, 40));
    } else {
      console.error("Error fetching news from NewsAPI:", error);
      res.status(500).send("Internal server error.");
    }
  } catch (error) {
    res.status(500).send("Internal server error.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
