// WRAPPERS!
let wrapper_init = document.getElementById("init-wrapper");
let wrapper_join = document.getElementById("login-wrapper");
let wrapper_wait = document.getElementById("wait-wrapper");

// JOIN ELEMENTS
//
// INIT ELEMENTS
//
// WAIT ELEMENETS
let wait_player_text = document.getElementById("player-block-text");
let wait_auxiliary_text = document.getElementById("wait-player-text");

function clear_display() {
  wrapper_init.style.display = "none";
  wrapper_join.style.display = "none";
  wrapper_wait.style.display = "none";
}

function display_init() {
  wrapper_init.style.display = "block";
}

function display_join() {
    wrapper_join.style.display = "block";

}

function display_wait(__username) {
  wrapper_wait.style.display = "block";
  wait_player_text.textContent = __username;
  wait_auxiliary_text.innerHTML = wait_auxiliary_text.textContent.replace(
    /\S/g,
    "<span class='letter'>$&</span>"
  );

  anime
    .timeline({ loop: true })
    .add({
      targets: "#wait-player-text .letter",
      opacity: [0, 1],
      easing: "easeInOutQuad",
      duration: 500,
      delay: (el, i) => 50 * (i + 1),
    })
    .add({
      targets: "#wait-player-text",
      opacity: 0,
      duration: 10,
      easing: "easeOutExpo",
      delay: 200,
    });
}

clear_display();
// display_wait("Yames");
display_join();
