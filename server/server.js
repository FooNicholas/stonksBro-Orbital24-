require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
import { Resend } from 'resend';


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'stonksbro-app', 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const supabaseURL = 'https://bihxlkqzfksexusydreo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseURL, supabaseKey);

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

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/update-password'
  });

  if (resetError) {
    console.error('Supabase error:', resetError.message);
    return res.status(500).send('Internal server error.');
  }

  res.status(200).send('Password reset email sent.');
});


app.post('/update-password', async (req, res) => {
  const { accessToken, newPassword } = req.body;

  if (!accessToken || !newPassword) {
    return res.status(400).send('Access token and new password are required.');
  }

  let hashedPassword = await bcrypt.hash(newPassword, 10);

  const { data, error } = await supabase.auth.updateUser({
    password: hashedPassword
  }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (error) {
    console.error('Supabase error:', error.message);
    return res.status(500).send('Internal server error.');
  }

  res.status(200).send('Password updated successfully.');
});


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
