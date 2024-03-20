const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

var displayRouter = require('./routes/display');
app.use('/display', displayRouter);


app.use(express.static(path.join(__dirname, 'public')));
// app.set('views', path.join(__dirname, 'views'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!');
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});