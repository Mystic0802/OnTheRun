const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '..', 'OTRDisplay')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'OTRDisplay', 'Views', 'Home.html'));
});

app.get('/Lobby', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'OTRDisplay', 'Views', 'Lobby.html'));
});

app.get('/Admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'OTRDisplay', 'Views', 'Admin.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});