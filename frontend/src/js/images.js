export const IMAGE = {};

const names = ["ship", "asteroid-l", "asteroid-m", "asteroid-s"];

export function preloadImages(callbackFunction) {
  function preloadImage(i) {
    if (i < names.length) {
      const img = new Image();
      img.onload = () => {
        preloadImage(i + 1);
      };
      IMAGE[names[i]] = img;
      img.src = `./img/${names[i]}.png`;
    } else {
      callbackFunction();
    }
  }
  preloadImage(0);
}
