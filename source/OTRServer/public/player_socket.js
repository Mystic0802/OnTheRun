// ====================================================================================
// WEBSOCKET
// ====================================================================================

let state = State.INIT;
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
let existing_username = get_cookie('username');
let existing_session_id = get_cookie('session_id');
if (existing_username && existing_session_id) {
    // Make sync request.
    socket.emit("player_get", {username: existing_username, session_id: existing_session_id});
}

socket.on("player_get_response", (__msg) => {
    console.log("get response:");
    console.log(__msg)
})


// STATE HANDLER
socket.on("state", (__msg) => {
  console.log("State: ", __msg)

})

// ====================================================================================
// LOGIN
// ====================================================================================

// Get input box and submit button
let login_name_input = document.getElementById("login-username-input");
let login_name_button = document.getElementById("login-button");
// Immediately hide the button so the user has to submit something
login_name_button.style.display = "none";
// Listen for input changes in the input box
login_name_input.addEventListener("input", (__input_event) => {
  // Automatically set all characters to uppercase
  __input_event.target.value = __input_event.target.value.toUpperCase();
  let value = __input_event.target.value;
  // If there is a valid name, show the submit, otherwise hide it again.
  login_name_button.style.display = value.length > 0 ? "flex" : "none";
});
// On submit button press
login_name_button.addEventListener("click", (__input_event) => {
  // Get name value
  let name_value = document.getElementById("login-username-input").value;
  if (name_value.length < 1) return;
  let msg = {
    name: name_value,
  };
  // Send name to server
  console.log(`Sending create player request: ${msg.name}`);
  socket.emit("player_create", msg);
});
// response from server for player create requests.
socket.on("player_create_response", (__msg) => {
  let msg_data = __msg;
  // expand on this if server side errors are done.
  if (msg_data.ok != true) return;
  // set cookie values from response
  set_cookie('username', msg_data.name, 1)
  set_cookie('session_id', msg_data.session_id, 1)
  // Clear the display and then show the waiting screen
  clear_display();
  display_wait(msg_data.name);
});




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
