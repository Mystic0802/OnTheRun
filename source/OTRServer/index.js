// ====================================================================================
// Server Init
// ====================================================================================

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

// ====================================================================================
// State Control
// ====================================================================================

// State logic enum equivalent.
const State = Object.freeze({
  INIT: Symbol("state_init"),
  JOIN: Symbol("state_join"),
  GAME_START: Symbol("state_game_start"),
  GAME_TRANSITION: Symbol("state_game_transition"),
});

const Transitions = Object.freeze({
  INIT_DONE: Symbol("init_done"),
  JOIN_DONE : Symbol("join_done")
})

function resolve_state(__input_state, __input_transition) {
  if(__input_transition == Transitions.INIT_DONE && __input_state == State.INIT) return State.JOIN
  else if(__input_state == Transitions.JOIN_DONE && __input_state == State.JOIN) return State.GAME_START
  else return __input_state
}

// THE STATE!!!1!!!
let state = State.INIT

// ====================================================================================
// Websocket Logic
// ====================================================================================


function create_message(__state, __data) {
  return {
    timestamp: Date.now(),
    state: __state,
    data: __data
  }
}


// Socket logic.
io.on("connection", (socket) => {
  console.log(`user connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`user disconnected: ${socket.id}`);
  });

  // display_get init logic.
  socket.on("display_get", (__msg, callback) => {
    try {
      // debug display testing
      state = resolve_state(state, Transitions.INIT_DONE)
      // this should emit the current state of the whole game
      // because this might be a refresh-recovery thing, the state
      // and all game data should be emitted. will be resolved on the client end.
      let msg = create_message(state.toString(), {})
      socket.emit("state", msg)

    } catch (e) {
      console.error(`Display_get error: ${e}`);
    }
  });
});

// ====================================================================================
// Server Start
// ====================================================================================


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
