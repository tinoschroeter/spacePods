const screens = document.querySelectorAll(".screen");

export function hideScreen() {
  screens.forEach((screen) => screen.classList.remove("visible"));
}

export function showScreen(name) {
  hideScreen();
  document.getElementById(`${name}Screen`).classList.add("visible");
}
