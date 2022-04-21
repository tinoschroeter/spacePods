import { Pod } from "./entities/Pod.js";
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
        Pod.removeAll();
        ship.reset();
      } else if (gameRunning) {
        showScreen("pause");
        gameRunning = false;
        Pod.stopGenerating();
      } else if (!gameRunning) {
        hideScreen();
        gameRunning = true;
        Pod.startGenerating();
        ship.showScore();
        ship.showPods();
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
    [...Lazer.list, ...Pod.list, ship, stars].forEach((obj) =>
      obj.update(ship)
    );
    [...Lazer.list, ...Pod.list, ship].forEach((obj) => obj.draw());
    if (gameRunning) requestAnimationFrame(gameLoop);
  }
});
