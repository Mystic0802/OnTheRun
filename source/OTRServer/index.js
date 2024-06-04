// ====================================================================================
// Server Init
// ====================================================================================

const { v4 } = require("uuid");

const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const { Server } = require("socket.io");
const { createServer, STATUS_CODES } = require("http");

var server = createServer(app);
const io = new Server(server, {
  path: "/game",
});

// ====================================================================================
// Players
// ====================================================================================

// Players dataclass
class Player {
  constructor(__name, __uuid, __socket_id) {
    this.name = __name;
    this.uuid = __uuid;
    this.socket_id = __socket_id;
    this.score = 0;
  }
}

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
  JOIN_DONE: Symbol("join_done"),
});

function resolve_state(__input_state, __input_transition) {
  if (
    __input_transition == Transitions.INIT_DONE &&
    __input_state == State.INIT
  )
    return State.JOIN;
  else if (
    __input_transition == Transitions.JOIN_DONE &&
    __input_state == State.JOIN
  )
    return State.GAME_START;
  else return __input_state;
}

// THE STATE!!!1!!!
let state = State.INIT;
// uuid -> Player (obj)
let players = new Map();
// socket -> uuid
let socket_uuid_map = new Map();
let player_chaser;

// ====================================================================================
// Websocket Logic
// ====================================================================================

function create_message(__state, __data) {
  return {
    timestamp: Date.now(),
    state: __state,
    data: __data,
  };
}

function check_ready() {
  // lobby full logic
  if (players.size >= 4 && player_chaser) {
    console.log("reached player cap");
    state = resolve_state(state, Transitions.JOIN_DONE);

    // let player_names = players.values().map(({ test }) => test);
    // console.log("players", players)
    // let player_names = players.map(({ test }) => test);
    console.log("player names: ", player_names);

    let msg = create_message(state.toString(), {});
    io.emit("state", msg);
  }
}

// Socket logic.
io.on("connection", (socket) => {
  console.log(`user connected: ${socket.id}`);

  // display_get init logic.
  // server discovering display for the first time
  // OR
  // display recovering state on a crash or something
  socket.on("display_get", (__msg, callback) => {
    try {
      // If this is the discovery, can now move forwards state.
      state = resolve_state(state, Transitions.INIT_DONE);
      // this should emit the current state of the whole game
      // because this might be a refresh-recovery thing, the state
      // and all game data should be emitted. will be resolved on the client end.
      let msg = create_message(state.toString(), {});
      socket.emit("state", msg);
    } catch (e) {
      console.error(`Display_get error: ${e}`);
    }
  });

  // create player requests
  socket.on("player_create", (__msg, callback) => {
    // don't let people join if not in the join state
    if (state != State.JOIN) return;
    try {
      let msg_data = __msg;
      if (!msg_data) throw new Error("no message received.");
      if (!msg_data.name) throw new Error("no name attribute on message.");
      console.log(`player create request: ${msg_data.name}`);

      // generate a uuid for the player
      let uuid = v4();
      // send the response
      let msg = {
        ok: true,
        name: msg_data.name,
        session_id: uuid,
      };
      socket.emit("player_create_response", msg);
      // add the uuid to the existing players list
      players.set(uuid, new Player(msg_data.name, uuid, socket.id));
      socket_uuid_map.set(socket.id, uuid);

      // check whether the game is ready.
      check_ready();
    } catch (e) {
      console.log(`Player_create error: ${e}`);
    }
  });

  // player recovery requests
  // to-do, actually sync it.
  socket.on("player_get", (__msg, callback) => {
    try {
      let msg_data = __msg;

      if (!msg_data) throw new Error("no message received.");
      if (!msg_data.username)
        throw new Error("no username given for existing session sync request.");
      if (!msg_data.session_id)
        throw new Error(
          "no session_id given for existing session sync request."
        );
      if (!players.has(msg_data.session_id))
        throw new Error(
          `get request with invalid session id: ${msg_data.session_id}`
        );

      console.log(
        `ok player get request: username:${msg_data.username},session_id:${msg_data.session_id}`
      );
      let player = players.get(msg_data.session_id);

      let msg = {
        ok: true,
        name: player.name,
        session_id: player.uuid,
      };
      socket.emit("player_get_response", msg);
    } catch (e) {
      console.log(`Player_get error: ${e}`);
    }
  });

  // disconnect logic.
  socket.on("disconnect", (__msg, callback) => {
    // try remove player from lists
    // only clear the lists if the game is in the joining state
    // otherwise keep the info so they can rejoin
    if (state != State.JOIN) return;
    console.log(`user disconnected: ${socket.id}`);
    try {
      console.log(`removing player`);
      let player_uuid = socket_uuid_map.get(socket.id);
      // remove records.
      players.delete(player_uuid);
      socket_uuid_map.delete(socket.id);
    } catch (e) {
      console.log(`disconnect error: ${e}`);
    }
  });
});

// ====================================================================================
// Server Start + Routes
// ====================================================================================

var displayRouter = require("./routes/display");
app.use("/display", displayRouter);
var playerRouter = require("./routes/player");
app.use("/", playerRouter);
var chaserRouter = require("./routes/chaser");
app.use("/chaser", chaserRouter)

app.use(express.static(path.join(__dirname, "public")));
// app.set('views', path.join(__dirname, 'views'))
app.use(express.json());

app.set("port", port);
console.log(`App listening at http://localhost:${port}`);

server.listen(port);

// ====================================================================================
// Utils
// ====================================================================================

// ====================================================================================
// TESTING
// ====================================================================================
// temporary players
let uuid1 = v4();
let uuid2 = v4();
let uuid3 = v4();
let uuid4 = v4();
players.set(uuid1, new Player("player1", uuid1, null));
players.set(uuid2, new Player("player2", uuid2, null));
players.set(uuid3, new Player("player3", uuid3, null));
