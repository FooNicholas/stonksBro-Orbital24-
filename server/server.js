require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js')

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'stonksbro-app', 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const supabaseURL = 'https://bihxlkqzfksexusydreo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseURL, supabaseKey);

app.use('/', (req,res) => {
  res.send('Server is running!');
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
    return res.status(400).send('User with this email or username already exists.');
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


let portfolio = [
  { symbol: 'AAPL', quantity: 10 },
  { symbol: 'GOOGL', quantity: 5 },
];

app.get('/portfolio', (req, res) => {
  res.json(portfolio);
});

app.post('/trade', (req, res) => {
  const { symbol, quantity, action } = req.body;
  if (action === 'buy') {
      portfolio.push({ symbol, quantity });
  } else if (action === 'sell') {
      portfolio = portfolio.filter(item => item.symbol !== symbol);
  }
  res.json(portfolio);
});


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
