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
// Spawn socket io server.
const io = new Server(server, {
  path: "/game",
});

// ====================================================================================
// Players
// ====================================================================================
/**
 * Player Dataclass/Class. Groups attributes for each distinct player using their unique UUID.
 * Both the chaser and regular players/contestants are stored internally using instances of this class.
 *
 * The UUID is stored inside the of the class, although a seperate reference is used to hash each player
 * in the players map.
 */
class Player {
  /**
   * @param {*} __name: Display name of the player.
   * @param {*} __uuid: UUID/session-id of the player.
   * @param {*} __socket_id: Socket.io/Websocket UUID through which the player is connected.
   */
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

/**
 * __! The variable: state (lowercase) is the server's running instance of this enumeration. !__ 
 * 
 * __! This enumeration differs slightly in elements to the states used in the client-side states.js. !__
 * 
 * Enumeration of the finite states the server can exist in.
 * Each state represents a distinct status of the game indicative of its name.
 *
 * For example, the server could be in the INIT state (representing initialization),
 * which would be a state mutually exclusive to the other possible states.
 *
 * __States__
 * - INIT : Initialization state for the server. It's purpose is to block processes, including joining, until a display client (the big screen) has been connected.
 * This will resultantly, not allow the game to run head-less.
 * - JOIN : State which enables clients to join the game as either players or the chaser. Persists whilst the required player count has not yet been met.
 * - GAME_START: Synchronization state which enables the server to transition all connected clients from the Waiting-Lobby screen onto the main game.
 * - GAME_TRANSITION: Currently Unused.
 */
const State = Object.freeze({
  INIT: Symbol("state_init"),
  JOIN: Symbol("state_join"),
  GAME_START: Symbol("state_game_start"),
  GAME_TRANSITION: Symbol("state_game_transition"),
});

/**
 *  __! This enumeration differs slightly in elements to the states used in the client-side states.js. !__
 * 
 * __! See @function resolve_state for  !__
 * 
 * Enumeration of the transitions through which the server's state can be changed. Each transition acts as a coin which permits a state to mutate in a defined manner
 * into another state.
 * 
 * For example, the INIT State can transition into the JOIN State if a valid 
 * 
 */
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

function get_player_names() {
  let a = [];
  // value, key
  players.forEach((playerObj, uuid) => {
    a.push(playerObj.name);
  });
  return a;
}

// checks whether the game_start state should be done.
function check_ready() {
  // lobby full logic
  console.log(`players size: ${players.size}, chaser: ${player_chaser}`);
  if (players.size < 4 || !player_chaser) return;
  console.log("reached player cap");
  state = resolve_state(state, Transitions.JOIN_DONE);

  let data = {
    player_names: get_player_names(),
    chaser_name: player_chaser.name,
  };
  let msg = create_message(state.toString(), data);
  io.emit("state", msg);
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
      let data = {};
      switch (state.description) {
        case State.GAME_START.description:
          data = {
            player_names: get_player_names(),
            chaser_name: player_chaser.name,
          };
      }
      console.log(`get display state: ${state.description}`);
      let msg = create_message(state.toString(), data);
      socket.emit("state", msg);
    } catch (e) {
      console.error(`Display_get error: ${e}`);
    }
  });

  // ====================================================================================
  // PLAYER CREATION
  // ====================================================================================

  // player recovery requests
  // to-do, actually sync it.
  // CHASER STUFF, ONLY PLAYER WORKS RN
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
      // request FORM is valid past this point.
      console.log(
        `ok player get request: username:${msg_data.username},session_id:${msg_data.session_id}`
      );
      // now check if the session id matches an existing player/chaser.

      // check if the player is the chaser first, with regular player as fallback.
      if (msg_data.session_id == player_chaser.uuid) {
        socket.emit("player_get_response", {
          ok: true,
          state: state.toString(),
          name: player_chaser.name,
          session_id: player_chaser.uuid,
        });
        console.log("restored chaser session");
        return;
      }

      if (!players.has(msg_data.session_id))
        throw new Error(
          `get request with invalid session id: ${msg_data.session_id}`
        );

      let player = players.get(msg_data.session_id);

      let msg = {
        ok: true,
        state: state.toString(),
        name: player.name,
        session_id: player.uuid,
      };
      socket.emit("player_get_response", msg);
      console.log("restored player session");
    } catch (e) {
      console.log(`Player_get error: ${e}`);
    }
  });

  // create player requests
  socket.on("player_create", (__msg, callback) => {
    // don't let people join if not in the join state
    if (state != State.JOIN) {
      console.error(
        "Cannot create player due to state. Likely display has not yet been connected!"
      );
      return;
    }
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

  socket.on("chaser_create", (__msg, callback) => {
    if (state != State.JOIN) {
      console.error(
        "Cannot create player due to state. Likely display has not yet been connected!"
      );
      return;
    }
    // if the chaser is already joined dont allow another
    if (player_chaser) {
      console.error("Cannot create chaser as chaser already exists.");
    }
    try {
      let msg_data = __msg;
      if (!msg_data) throw new Error("no message received.");
      if (!msg_data.name) throw new Error("no name attribute on message.");
      console.log(`chaser create request: ${msg_data.name}`);

      // generate a uuid for the player
      let uuid = v4();
      // send the response
      let msg = {
        ok: true,
        name: msg_data.name,
        session_id: uuid,
      };
      // set chaser player value
      player_chaser = new Player(msg_data.name, uuid, socket.id);
      // check whether the game is ready.
      check_ready();

      socket.emit("chaser_create_response", msg);
    } catch (e) {
      console.log(`Chaser_create error: ${e}`);
    }
  });

  // ====================================================================================
  // DISCONNECT
  // ====================================================================================

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
      // check if they are the chaser, and if so, remove them so a new chaser can be created
      // awkward code because need to check if player object exists before checking uuid attribute
      if (player_chaser) {
        if (player_chaser.socket_id == socket.id) {
          player_chaser = undefined;
        }
      }
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
app.use("/chaser", chaserRouter);

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
// let uuid4 = v4();
players.set(uuid1, new Player("player1", uuid1, null));
players.set(uuid2, new Player("player2", uuid2, null));
players.set(uuid3, new Player("player3", uuid3, null));
// players.set(uuid4, new Player("player4", uuid4, null));
