require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, "stonksbro-app", "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET_KEY;

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
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
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
    if (existingUsers.some(user => user.email === email)) {
      return res.status(400).send("Email is already registered.");
    }
    if (existingUsers.some(user => user.username === username)) {
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
    <p>If you did not request this, please ignore this email.</p>` 
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
    console.error("Supabase error:", userError ? userError.message : "User not found");
    return res.status(400).send("Invalid or expired token.");
  }

  const now = new Date();
  if (now > new Date(user.reset_token_expiration)) {
    return res.status(400).send("Token has expired.");
  }

  let hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from("users")
    .update({ hashedPassword: hashedPassword, reset_token: null, reset_token_expiration: null })
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
      return res.status(400).send("Sender ID and receiver username are required.");
  }

  const { data: receiver, error: receiverError } = await supabase
      .from("users")
      .select("id")
      .eq("username", receiverUsername)
      .single();  

  if (receiverError || !receiver) {
      return res.status(404).send("User not found.");
  }

  const date = new Date();

  const { error: insertError } = await supabase
      .from("friend_request")
      .insert([{ sender_id: senderId, receiver_id: receiver.id, created_at: date }]);

  if (insertError) {
      console.error("Supabase error:", insertError.message);
      return res.status(500).send("Internal server error.");
  }

  res.status(200).send("Friend request sent successfully.");
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
    const senderIds = requests.map(request => request.sender_id);
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username")
      .in("id", senderIds);

    if (usersError) {
      console.error("Supabase error:", usersError.message);
      return res.status(500).send("Internal server error.");
    }

    // Map usernames to friend requests
    const requestsWithUsernames = requests.map(request => {
      const sender = users.find(user => user.id === request.sender_id);
      return { ...request, sender_username: sender ? sender.username : "Unknown" };
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
    .insert([{user_id: userId, friends_id: senderId}, {user_id: senderId, friends_id: userId}]);

    if (addFriendError) {
      console.error("Error inserting into friends table:", addFriendError);
      return res.status(500).send("Internal server error.");
   }

   const { data: deleteRequest, error: deleteRequestError } = await supabase
   .from("friend_request")
   .delete()
   .match({receiver_id: userId, sender_id: senderId});

   if (deleteRequestError) {
    console.error("Error deleting from friend_request table:", deleteRequestError);
    return res.status(500).send("Internal server error.");
    }
    
    res.status(200).send("Friend request accepted successfully.")
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
   .match({receiver_id: userId, sender_id: senderId});

   if (deleteRequestError) {
    console.error("Error deleting from friend_request table:", deleteRequestError);
    return res.status(500).send("Internal server error.");
    }

    res.status(200).send("Friend request rejected successfully.")
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
    
    const friend_id = friends.map(request => request.friends_id);
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

  const fileName = avatar;

  try {
    const { data: icon, error: retrieveIconError } = supabase
      .storage
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
    .single()

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
    const { data: updateWatchlist, error: updateWatchlistError } = await supabase
    .from("users")
    .update({watchlist: newWatchlist})
    .eq("id", userId)

    if (updateWatchlistError) {
      console.error("Supabase error:", updateWatchlistError.message);
      return res.status(500).send("Internal server error.")
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
    const { data: updateWatchlist, error: updateWatchlistError } = await supabase
    .from("users")
    .update({watchlist: newWatchlist})
    .eq("id", userId)

    if (updateWatchlistError) {
      console.error("Supabase error:", updateWatchlistError.message);
      return res.status(500).send("Internal server error.")
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
    .single()

    if (fetchTickerError) {
      console.error("Supabase error:", fetchTickerError.message)
      return res.status(500).send("Internal server error.")
    }

    res.status(200).json(tickers.ticker)
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
    .update({ticker: symbols})
    .eq("id", userId)

    if (fetchTickerError) {
      console.error("Supabase error:", fetchTickerError.message)
      return res.status(500).send("Internal server error.")
    }

    res.status(200).send("Success")
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
