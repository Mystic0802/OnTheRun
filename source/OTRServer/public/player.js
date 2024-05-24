// ====================================================================================
// WEBSOCKET
// ====================================================================================


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
