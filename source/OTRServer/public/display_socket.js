import display_render from "./display_render.js";

// ====================================================================================
// State Control
// ====================================================================================


// // State logic enum equivalent.
// const State = Object.freeze({
//   INIT: Symbol("state_init"),
//   JOIN: Symbol("state_join"),
//   GAME_START: Symbol("state_game_start"),
//   GAME_TRANSITION: Symbol("state_game_transition"),
// });

const STATE_REGEX = RegExp(/\(.+\)/, "g");

function extract_state(__state_string) {
  return STATE_REGEX.exec(__state_string);
}

// ====================================================================================
// Pretty much all logic
// ====================================================================================

let state = State.INIT;
let connected = false;
let renderer = display_render.renderer
// Initialize socket on game path
// this might change if I figure out how to do multiple socket.io clients.
const socket = io({
  path: socket_path,
});
socket.on("connect", () => {
  console.log(`Got connection to ${socket_path}`);
  connected = true;
  socket.emit("display_get", "display_get");
});
// Relay state messages to the handle state method.
socket.on("state", handle_state_msg);
// Relay un-state-specified data to the handle data method.
socket.on("display_data", handle_new_data);

//
//
//

function display_join_init() {
  renderer.clear_elements();
  renderer.MACRO_JOIN_INIT();
  renderer.render_elements();
}

function handle_new_data(__msg) {
  console.log("b");
}

function handle_state_msg(__state_msg) {
  if (connected == false) return;
  let state;
  // Try to extract state from message
  // We quarantine this as the object might not have a state attribute on it.
  try {
    state = extract_state(__state_msg.state);
    if (state == null) return;
  } catch (e) {
    console.error(e);
  }
  let state_val = state[0].replace(/^\(+|\)+$/g, "");
  switch (state_val) {
    case State.INIT.description:
      console.log("Initialized Ok");
      // Don't need to do anything, we've already let the server know we are setup.
      break;
    case State.JOIN.description:
      console.log("Join State Received.");
      display_join_init()
      break;
    default:
      console.error(`Unrecognised State: ${state_val}`);
      break;
  }
}
