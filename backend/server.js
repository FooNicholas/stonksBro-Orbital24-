const express = require('express');
const app = express();
const port = 5000;

app.use(express.static('../stonksbro-app/'));

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running'})
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});