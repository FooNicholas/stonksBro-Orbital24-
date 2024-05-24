const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection( {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stonksbro' 
  });

exports.register = (req, res) => {
    console.log(req.body);

    const { username, email, password, passwordConfirm } = req.body;

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error);
        }

        if (result.length > 0) {
            return res.render('register', {
                message: 'That email is already in use!'
            })
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'The passwords do not match!'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

    });

    db.query('INESERT INTO users SET ?', {username: username, email: email, password: hashedPassword}, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            console.log(result);
            return res.render('register', {
                message: 'User registered!'
            });
        }
    })

}