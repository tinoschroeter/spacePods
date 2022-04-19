import { Pods } from "./entities/Pods.js";
import { Lazer } from "./entities/Lazer.js";
import { SpaceShip } from "./entities/SpaceShip.js";
import { clearCanvas, makeCanvasesFullScreen } from "./canvas.js";
import { debounce } from "./helper.js";
import { preloadImages } from "./images.js";
import { Stars } from "./Stars.js";
import { hideScreen, showScreen } from "./screens.js";

makeCanvasesFullScreen();
showScreen("loading");

preloadImages(() => {
  showScreen("start");

  const stars = new Stars();
  const ship = new SpaceShip();

  let gameRunning = false;

  stars.generate();
  stars.draw();

  window.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      if (ship.destroyed) {
        hideScreen();
        Pods.removeAll();
        ship.reset();
      } else if (gameRunning) {
        showScreen("pause");
        gameRunning = false;
        Pods.stopGenerating();
      } else if (!gameRunning) {
        hideScreen();
        gameRunning = true;
        Pods.startGenerating();
        ship.showScore();
        gameLoop();
      }
    }
  });

  window.addEventListener(
    "resize",
    debounce(() => {
      makeCanvasesFullScreen();
      stars.generate();
      stars.draw();
    }, 150)
  );

  function gameLoop() {
    clearCanvas("entity");
    [...Lazer.list, ...Pods.list, ship, stars].forEach((obj) =>
      obj.update(ship)
    );
    [...Lazer.list, ...Pods.list, ship].forEach((obj) => obj.draw());
    if (gameRunning) requestAnimationFrame(gameLoop);
  }
});
