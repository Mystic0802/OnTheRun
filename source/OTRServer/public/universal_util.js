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
// Initialize socket on game path
// this might change if I figure out how to do multiple socket.io clients.
const socket = io({
  path: socket_path,
});
socket.on("connect", () => {
  console.log(`Got connection to ${socket_path}`);
  connected = true;
});

// Check if the device already has a valid session.
// this will run for the chaser too but will never work.
// its okay since it'll only be one request.
let existing_username = get_cookie("username");
let existing_session_id = get_cookie("session_id");
if (existing_username && existing_session_id) {
  // Make sync request.
  console.log("Existing 'Session ID' detected, sending get request")
  socket.emit("player_get", {
    username: existing_username,
    session_id: existing_session_id,
  });
}

/**
 * Synchronisation pseudo-callback.
 * 
 * Handles the synchronisation response in order to restore state using the received data.
 */
socket.on("player_get_response", (__msg) => {
  try {
    console.log(__msg)
    // this will likely never throw, but just in case.
    if (connected = false) return;
    // extra careful checking of the response message.
    if (!__msg.hasOwnProperty("ok")) throw Error("No status on response message")
    if (!__msg.hasOwnProperty("session_id")) throw Error("No session id echo on response message")
    if (__msg.ok != true) return;
    // Try to extract state from message
    let new_state = extract_state(__msg.state);
    if (new_state == null) return;
    // get the string form of the state.
    let state_val = new_state[0].replace(/^\(+|\)+$/g, "")
    handle_state(state_val)
  } catch(e) {
    console.error(e)
  }
});

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
      // Don't need to do anything, we've already let the server know we are setup.
      break;
    case State.JOIN.description:
      state = State.JOIN;
      console.log("Join State Received.");
      break;
    case State.GAME_START.description:
      state = State.GAME_START;
      console.log("Game_Start State Receieved.");
      clear_display();
      let username = get_cookie("username");
      display_game_start(username);
      break;
    default:
      console.error(`Unrecognised State: ${state_val}`);
      break;
  }
}

/**
 * Specifically parses state update messages in order to determine the new state for the client.
 * @param {*} __state_msg: JSON object received via Websocket.
 * @returns 
 */
function handle_state_msg(__state_msg) {
  console.log(__state_msg);
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

// ====================================================================================
// COOKIE UTILS
// ====================================================================================

function set_cookie(__cname, __cvalue, __exdays) {
  /***
   * @param __cname: Name of the cookie as string.
   * @param __cvalue: Value to assign to the cookie name.
   * @param __exdays: Cookie expiry in days.
   */
  const d = new Date();
  d.setTime(d.getTime() + __exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = __cname + "=" + __cvalue + ";" + expires + ";path=/";
}

function get_cookie(__cname) {
  /***
   * @param __cname: Name of the cookie as string.
   * @returns Value of cookie if found otherwise nothing.
   */
  let name = __cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
