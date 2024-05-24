const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 5000;

const db = mysql.createConnection( {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stonksbro' 
})

app.use(express.static(path.join(__dirname, 'stonksbro-app', 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

db.connect( (error) => {
  if (error) {
    console.log(error)
  } else {
    console.log('MySQL Connected')
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/auth', require('./routes/auth.js'));

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});