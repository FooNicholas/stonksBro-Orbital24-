const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'stonksbro-app', 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = mysql.createConnection( {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stonksbro' 
})

db.connect( (error) => {
  if (error) {
    console.log(error)
  } else {
    console.log('MySQL Connected')
  }
})

app.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email, password], async (err, results) => {
    if (err) {
      return res.status(500).send('Server error.');
    }

    if (results.length === 0) {
      return res.status(401).send('Invalid email or password.');
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (isPasswordValid) {
      res.status(200).send('Login successful.');
    } else {
      res.status(401).send('Invalid email or password.');
    }    
  });
});


app.post('/register', (req,res) => {
  const {username, email, password, passwordConfirm} = req.body;

  if (!username || !email || !password || !passwordConfirm) {
    return res.send(400).send('All fields are required.');
  }

  if (password !== passwordConfirm) {
    return res.status(400).send('Passwords do not match.');
  }

  // Optional: Check if user already exists
  db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], async (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).send('Internal server error.');
    }

    if (results.length > 0) {
      return res.status(400).send('User with this email or username already exists.');
    }

    let hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const newUser = { username, email, hashedPassword };
    db.query('INSERT INTO users SET ?', newUser, (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).send('Internal server error.');
      }

      res.status(200).send('Registration successful');
    });
  });
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