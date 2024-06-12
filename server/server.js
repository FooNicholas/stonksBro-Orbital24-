require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'stonksbro-app', 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const supabaseURL = 'https://bihxlkqzfksexusydreo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseURL, supabaseKey);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADD,
    pass: process.env.APP_PW,
  },
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  const { data: users, error } = await supabase
    .from('users')
    .select()
    .eq('email', email);

  if (error) {
    return res.status(500).send('Server error.');
  }

  if (users.length === 0) {
    return res.status(401).send('Invalid email or password.');
  }

  const user = users[0];
  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

  if (isPasswordValid) {
    res.status(200).send('Login successful.');
  } else {
    res.status(401).send('Invalid email or password.');
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password, passwordConfirm } = req.body;

  if (!username || !email || !password || !passwordConfirm) {
    return res.status(400).send('All fields are required.');
  }

  if (password !== passwordConfirm) {
    return res.status(400).send('Passwords do not match.');
  }

  const { data: existingUsers, error: existingUsersError } = await supabase
    .from('users')
    .select()
    .or(`email.eq.${email},username.eq.${username}`);

  if (existingUsersError) {
    console.error('Supabase error:', existingUsersError.message);
    return res.status(500).send('Internal server error.');
  }

  if (existingUsers.length > 0) {
    if (existingUsers.some(user => user.email === email)) {
      return res.status(400).send('Email is already registered.');
    }
    if (existingUsers.some(user => user.username === username)) {
      return res.status(400).send('Username is already taken.');
    }

  }

  let hashedPassword = await bcrypt.hash(password, 10);

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert([{ username, email, hashedPassword }]);

  if (insertError) {
    console.error('Supabase error:', insertError.message);
    return res.status(500).send('Internal server error.');
  }

  res.status(200).send('Registration successful');
});

app.post('/reset', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required.');
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError) {
    console.error('Supabase error:', userError.message);
    return res.status(404).send('User not found');
  }

  const resetToken = require('crypto').randomBytes(20).toString('hex');
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1); // 1 hour expiration

  const { error: tokenError } = await supabase
    .from('users')
    .update({ reset_token: resetToken, reset_token_expiration: expiration })
    .eq('id', user.id);

  if (tokenError) {
    console.error('Supabase error:', tokenError.message);
    return res.status(500).send('Internal server error.');
  }

  const resetURL = `https://stonks-bro-orbital24.vercel.app/update-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_ADD,
    to: email,
    subject: 'Password Reset',
    html: `
    <p>You requested a password reset.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>` 
  };

  console.log(mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Error sending email.');
    }
    res.status(200).send('Password reset email sent.');
  });
});


app.post('/update-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).send('Token and new password are required.');
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, reset_token_expiration')
    .eq('reset_token', token)
    .single();

  if (userError || !user) {
    console.error('Supabase error:', userError ? userError.message : 'User not found');
    return res.status(400).send('Invalid or expired token.');
  }

  const now = new Date();
  if (now > new Date(user.reset_token_expiration)) {
    return res.status(400).send('Token has expired.');
  }

  let hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from('users')
    .update({ hashedPassword: hashedPassword, reset_token: null, reset_token_expiration: null })
    .eq('id', user.id);

  if (updateError) {
    console.error('Supabase error:', updateError.message);
    return res.status(500).send('Internal server error.');
  }

  res.status(200).send('Password updated successfully.');
});


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
