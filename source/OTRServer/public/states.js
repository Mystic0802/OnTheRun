// Default Socket Path
const socket_path = "/game";

// State logic enum equivalent.
const State = Object.freeze({
    INIT: Symbol("state_init"),
    JOIN: Symbol("state_join"),
    GAME_START: Symbol("state_game_start"),
    GAME_TRANSITION: Symbol("state_game_transition"),
  });

// State util
const STATE_REGEX = RegExp(/\(.+\)/, "g");
function extract_state(__state_string) {
  return STATE_REGEX.exec(__state_string);
}
  