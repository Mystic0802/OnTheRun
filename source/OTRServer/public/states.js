// Default Socket Path
const socket_path = "/game";

// State logic enum equivalent.
const State = Object.freeze({
  INIT: Symbol("state_init"),
  JOIN: Symbol("state_join"),
  GAME_START: Symbol("state_game_start"),
  GAME_TRANSITION: Symbol("state_game_transition"),
  QUICKFIRE_ONE: Symbol("state_quickfire_one"),
  QUICKFIRE_TWO: Symbol("state_quickfire_two"),
  QUICKFIRE_THREE: Symbol("state_quickfire_three"),
  QUICKFIRE_FOUR: Symbol("state_quickfire_four"),
  NONE: Symbol("state_none"),
});

const QuickFireStates = [
  State.QUICKFIRE_ONE,
  State.QUICKFIRE_TWO,
  State.QUICKFIRE_THREE,
  State.QUICKFIRE_FOUR,
];

// State util
const STATE_REGEX = RegExp(/\(.+\)/, "g");
function extract_state(__state_string) {
  return STATE_REGEX.exec(__state_string);
}
