// ====================================================================================
// GAME SETTINGS DEFINITION
// ====================================================================================

class AdminPlayerInterface {
    constructor(__display_name, __money_score = 0) {
        this.display_name = __display_name
        this.money_score = __money_score
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

    constructor() {
        this.game_state = State.NONE
        this.player_interface_list = [];
        this.chaser_interface;
    }

    get_settings() {


    }
}

let settings = new SettingsHandler()


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
  socket.emit("admin_get", {})
});

// manual state request sync.
socket.on("admin_get_response", (__msg) => {
    let msg = __msg
    console.log("Received Sync, handling admin state...")
    handle_state_msg(msg)
})

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
      break;
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
  handle_state(state_val)
}