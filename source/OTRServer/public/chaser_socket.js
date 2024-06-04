// This file is largely similar to "player_socket.js", with logic modifications for the chaser's interface.

// ====================================================================================
// LOGIN
// ====================================================================================

// Get input box and submit button
let login_name_input = document.getElementById("login-username-input");
let login_name_button = document.getElementById("c-login-button");
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
  console.log(`Sending create chaser request: ${msg.name}`);
  // ! Changed from player_create to chaser_create for chaser specific logic.
  socket.emit("chaser_create", msg);
});
// response from server for chaser create requests.
// ! Changed from player_create_response for chaser specific logic.
socket.on("chaser_create_response", (__msg) => {
    let msg_data = __msg;
    // expand on this if server side errors are done.
    if (msg_data.ok != true) return;
    // set cookie values from response
    set_cookie("username", msg_data.name, 1);
    set_cookie("session_id", msg_data.session_id, 1);
    // Clear the display and then show the waiting screen
    clear_display();
    display_wait(msg_data.name);
  });
  