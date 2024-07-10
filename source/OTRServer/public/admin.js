// ====================================================================================
// GAME SETTINGS DEFINITION
// ====================================================================================

class AdminPlayerInterface {
  constructor(__display_name, __money_score = 0) {
    this.display_name = __display_name;
    this.money_score = __money_score;
  }
}

class SettingsHandler {
  /**
   * Declare all the settings for clarity. We don't have the values for them yet.
   *
   * Based on state, we make requests to the server for values.
   * Gradually this will fill all the missing values.
   *
   */

  constructor(__socket) {
    this.socket = __socket

    this.game_state = State.NONE;
    this.player_interface_list = [];
    this.chaser_interface;

    this.working_balance = 0;

    // binding internal request handlers.
    this.socket.on("admin_res_get_start", this.response_get_start)
  }

  get_settings(__state) {
    console.log("get settings", __state)
    switch(__state) {
      case State.GAME_START.description:
        this.socket.emit("admin_req_get_start", {})
        break
      default:
        break
    }

  }

  // Response Handlers
  response_get_start(__msg) {
    console.log(__msg)
  }

  // GUI Handlers
  handle_correct() {
    if (QuickFireStates.includes(state) == false) return;
    this.socket.emit("admin_quickfire_correct", {})
  }

  handle_incorrect() {
    if (QuickFireStates.includes(state) == false) return;
    this.socket.emit("admin_quickfire_incorrect", {})
  }

  handle_undo() {
    if (QuickFireStates.includes(state) == false) return;
    this.socket.emit("admin_quickfire_undo", {})
  }
}


// ====================================================================================
// WEBSOCKET
// ====================================================================================

/**
 * __! Not to be confused with State (uppercase) which is the enumeration of possible client states !__
 *
 * State instance of the client.
 *
 * Instance of the client-side state Enumeration as per states.js
 */
let state = State.INIT;
// Flag for whether has yet to establish a websocket connection.
let connected = false;
// Flag for if the settings have been receieved, and therefore synced with the server.
let settings_connected = false;
// Initialize socket on game path
// this might change if I figure out how to do multiple socket.io clients.
const socket = io({
  path: socket_path,
});
socket.on("connect", () => {
  console.log(`Got connection to ${socket_path}`);
  connected = true;

  // make client request to sync state.
  socket.emit("admin_get", {});
});

// manual state request sync.
socket.on("admin_get_response", (__msg) => {
  let msg = __msg;
  console.log("Received Sync, handling admin state...");
  handle_state_msg(msg);
});


let settings = new SettingsHandler(socket);

// ====================================================================================
// STATE LOGIC
// ====================================================================================

// STATE HANDLER
socket.on("state", handle_state_msg);

/**
 * Implementation of state updates and associated handling.
 *
 * Input states are processed to determine how the frontend should mutate.
 * @param {*} __state_val: Raw state enumeration value.
 */
function handle_state(__state_val) {
  // boiler-plate state code.
  switch (__state_val) {
    case State.INIT.description:
      state = State.INIT;
      console.log("Initialized Ok");
      break;
    case State.JOIN.description:
      state = State.JOIN;
      console.log("Join State Received.");
      break;
    case State.GAME_START.description:
      state = State.GAME_START;
      console.log("Game_Start State Receieved.");
      break;
    default:
      console.error(`Unrecognised State: ${state_val}`);
      return;
  }
}

/**
 * Specifically parses state update messages in order to determine the new state for the client.
 *
 * Calls the state changing procedure automatically if given a valid message.
 * @param {*} __state_msg: JSON object received via Websocket.
 * @returns
 */
function handle_state_msg(__state_msg) {
  if (connected == false) return;
  let new_state;
  // Try to extract state from message
  // We quarantine this as the object might not have a state attribute on it.
  try {
    new_state = extract_state(__state_msg.state);
    if (new_state == null) return;
  } catch (e) {
    console.error(e);
  }
  let state_val = new_state[0].replace(/^\(+|\)+$/g, "");
  handle_state(state_val);
  // Admin specific state stuff.
  // State-wise data requesting
  settings.get_settings(state_val)

}

// ====================================================================================
// RENDERING AND EVENTS
// ====================================================================================

const correct_answer_btn = document.getElementById("answer-correct");
const incorrect_answer_btn = document.getElementById("answer-incorrect");
const undo_answer_btn = document.getElementById("answer-undo");

correct_answer_btn.addEventListener("click", () => {
  state = State.QUICKFIRE_ONE;

  settings.handle_correct();
});

incorrect_answer_btn.addEventListener("click", () => {
  state = State.QUICKFIRE_ONE;

  settings.handle_incorrect();
});

undo_answer_btn.addEventListener("click", () => {
  state = State.QUICKFIRE_ONE;

  settings.handle_undo();
});

// ====================================================================================
// KEYBIND HANDLING
// ====================================================================================

addEventListener("keypress", (__key_id) => {
  switch (__key_id.key) {
    case "z":
      settings.handle_correct();
      break;
    case "x":
      settings.handle_incorrect();
      break;
    case "c":
      settings.handle_undo();
      break;
    default:
      return;
  }
});
