// State logic enum equivalent.
const State = Object.freeze({
    INIT: Symbol("state_init"),
    JOIN: Symbol("state_join"),
    GAME_START: Symbol("state_game_start"),
    GAME_TRANSITION: Symbol("state_game_transition"),
  });