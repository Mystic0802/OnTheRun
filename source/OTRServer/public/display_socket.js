import display_render from "./display_render.js";

// ====================================================================================
// State Control
// ====================================================================================

let state = State.INIT;
let connected = false;

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
  switch (state_val) {
    case State.INIT.description:
      state = State.INIT;
      console.log("Initialized Ok");
      // Don't need to do anything, we've already let the server know we are setup.
      break;
    case State.JOIN.description:
      console.log("Join State Received.");
      state = State.JOIN;
      display_join_init();
      break;
    case State.GAME_START.description:
      state = State.GAME_START;
      console.log("Game_Start State Receieved.");
      console.log(__state_msg.data)
      display_game_start();
      break;
    default:
      console.error(`Unrecognised State: ${state_val}`);
      break;
  }
}

// ====================================================================================
// Pretty much all logic
// ====================================================================================

let renderer = display_render.renderer;
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

function display_game_start() {
  renderer.clear_elements();
  // add the element spaces, which have empty internal values
  renderer.MACRO_GAME_START_INIT();
  // fill in the values using references 
  console.log(renderer.get_element("player_one_block"))
  
  renderer.render_elements();
}

function handle_new_data(__msg) {
  console.log("b");
}
