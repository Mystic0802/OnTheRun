const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const { Server } = require("socket.io");
const { createServer } = require("http");

var server = createServer(app);
const io = new Server(server, {
  path: "/game",
});

io.on("connection", (socket) => {
  console.log(`user connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`user disconnected: ${socket.id}`);
  });

  socket.on("display_get", (__msg, callback) => {
    try {
      console.log(`got display_get: ${__msg}`)
    } catch (e) {
      console.error(`Display_get error: ${e}`);
    }
  });
});

var displayRouter = require("./routes/display");
app.use("/display", displayRouter);

app.use(express.static(path.join(__dirname, "public")));
// app.set('views', path.join(__dirname, 'views'))
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.set("port", port);
console.log(`App listening at http://localhost:${port}`);

server.listen(port);
