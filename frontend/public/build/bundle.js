(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/js/canvas.js
  var canvas = {
    entity: document.getElementById("entityCanvas"),
    star1: document.getElementById("starCanvas1"),
    star2: document.getElementById("starCanvas2"),
    star3: document.getElementById("starCanvas3")
  };
  var ctx = {
    entity: canvas.entity.getContext("2d"),
    star1: canvas.star1.getContext("2d"),
    star2: canvas.star2.getContext("2d"),
    star3: canvas.star3.getContext("2d")
  };
  function makeCanvasFullScreen(canv, factor = 1) {
    canv.width = factor * window.innerWidth;
    canv.height = factor * window.innerHeight;
  }
  function makeCanvasesFullScreen() {
    makeCanvasFullScreen(canvas.entity);
    makeCanvasFullScreen(canvas.star1, 2);
    makeCanvasFullScreen(canvas.star2, 2);
    makeCanvasFullScreen(canvas.star3, 2);
  }
  function clearCanvas(key) {
    ctx[key].clearRect(0, 0, canvas[key].width, canvas[key].height);
  }

  // src/js/helper.js
  function debounce(fn, delay) {
    let id;
    return (...args) => {
      if (id)
        clearTimeout(id);
      id = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  }
  function randInt(a, b) {
    return a + Math.floor((b - a) * Math.random());
  }
  function randEl(list) {
    return list[randInt(0, list.length)];
  }
  function distance(u, v) {
    return Math.sqrt(Math.pow(u.x - v.x, 2) + Math.pow(u.y - v.y, 2));
  }

  // src/js/images.js
  var IMAGE = {};
  var names = ["ship", "asteroid-l", "asteroid-m", "asteroid-s"];
  function preloadImages(callbackFunction) {
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

  // src/js/screens.js
  var screens = document.querySelectorAll(".screen");
  function hideScreen() {
    screens.forEach((screen) => screen.classList.remove("visible"));
  }
  function showScreen(name) {
    hideScreen();
    document.getElementById(`${name}Screen`).classList.add("visible");
  }

  // src/js/entities/Pod.js
  var _Pod = class {
    static removeAll() {
      _Pod.list = [];
    }
    static startGenerating(frequency = 1e3) {
      _Pod.interval = setInterval(() => {
        fetch(_Pod.api).then((res) => res.json()).then((data) => {
          _Pod.count = data.length;
          data.forEach((item) => new _Pod(item.name));
        }).catch((e) => {
          _Pod.errorScore++;
          console.error(e);
        });
      }, frequency);
    }
    static stopGenerating() {
      clearInterval(_Pod.interval);
    }
    constructor(podName) {
      if (_Pod.list.find((item) => item.podName === podName))
        return;
      this.podName = podName;
      this.type = randEl(["l", "m"]);
      const name = "asteroid-" + this.type;
      this.image = IMAGE[name];
      this.size = _Pod.SIZE[this.type];
      const startSide = randEl(["left", "right", "top", "bottom"]);
      switch (startSide) {
        case "left":
          this.pos = {
            x: -this.size / 2,
            y: randInt(0, canvas.star1.height)
          };
          this.vel = { x: randInt(1, 3), y: randInt(-2, 4) };
          break;
        case "right":
          this.pos = {
            x: canvas.star1.width + this.size / 2,
            y: randInt(0, canvas.star1.height)
          };
          this.vel = { x: -randInt(1, 3), y: randInt(-2, 4) };
          break;
        case "top":
          this.pos = {
            x: randInt(0, canvas.star1.width),
            y: -this.size / 2
          };
          this.vel = { x: randInt(-2, 4), y: randInt(1, 3) };
          break;
        case "bottom":
          this.pos = {
            x: randInt(0, canvas.star1.width),
            y: canvas.star1.height + this.size / 2
          };
          this.vel = { x: randInt(-2, 4), y: -randInt(1, 3) };
          break;
      }
      this.animationTimer = 0;
      this.frameCount = _Pod.FRAME_COUNT[this.type];
      this.parallax = 1;
      this.drawPos = { x: 0, y: 0 };
      this.destroyed = false;
      this.score = _Pod.SCORE[this.type];
      _Pod.list.push(this);
    }
    update(ship) {
      this.animationTimer++;
      if (this.animationTimer >= this.frameCount)
        this.animationTimer = 0;
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
      this.drawPos = {
        x: this.pos.x - this.parallax * ship.pos.x,
        y: this.pos.y - this.parallax * ship.pos.y
      };
      if (this.destroyed) {
        this.vel = { x: 0, y: 0 };
        this.size *= 0.8;
        if (this.size <= 1) {
          this.destroy();
        }
      }
      this.removeIfOutside();
    }
    draw() {
      ctx.entity.save();
      ctx.entity.translate(this.drawPos.x, this.drawPos.y);
      ctx.entity.drawImage(this.image, this.animationTimer * _Pod.SIZE[this.type], 0, _Pod.SIZE[this.type], _Pod.SIZE[this.type], -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.entity.fillStyle = "#FFA500";
      ctx.entity.font = "18px serif";
      ctx.entity.textAlign = "center";
      ctx.entity.fillText(this.podName, 0, 0);
      ctx.entity.restore();
    }
    removeIfOutside() {
      if (this.pos.x + this.size / 2 < 0 || this.pos.y + this.size / 2 < 0 || this.pos.x > canvas.star1.width + this.size / 2 || this.pos.y > canvas.star1.height + this.size / 2) {
        this.remove();
      }
    }
    remove() {
      _Pod.list = _Pod.list.filter((a) => a != this);
    }
    destroy() {
      fetch(`${_Pod.api}/${this.podName}`, {
        method: "DELETE"
      }).then((res) => res.json()).then((data) => console.log(data)).catch((e) => {
        _Pod.errorScore++;
        console.error(e);
      });
      this.remove();
    }
    destroyShip(ship) {
      if (!ship.destroyed && distance(ship.pos, this.drawPos) < ship.size.x / 2 + this.size / 2) {
        ship.destroyed = true;
        ship.rotationForce = randEl([1, -1]) * 0.2;
        showScreen("gameover");
      }
    }
  };
  var Pod = _Pod;
  __publicField(Pod, "list", []);
  __publicField(Pod, "counts", 0);
  __publicField(Pod, "api", "https://spacepod.tino.sh/api/pods");
  __publicField(Pod, "SIZE", {
    m: 64,
    l: 128
  });
  __publicField(Pod, "FRAME_COUNT", {
    m: 60,
    l: 120
  });
  __publicField(Pod, "SCORE", {
    m: 1,
    l: 1
  });
  __publicField(Pod, "interval", null);
  __publicField(Pod, "errorScore", 0);

  // src/js/entities/Lazer.js
  var _Lazer = class {
    constructor({ pos, initialVel, rotation }) {
      this.pos = pos;
      this.rotation = rotation;
      this.speed = 15;
      this.vel = {
        x: initialVel.x + this.speed * Math.cos(rotation),
        y: initialVel.y + this.speed * Math.sin(rotation)
      };
      _Lazer.list.push(this);
    }
    draw() {
      ctx.entity.save();
      ctx.entity.fillStyle = "green";
      ctx.entity.globalAlpha = 0.8;
      ctx.entity.translate(this.pos.x, this.pos.y);
      ctx.entity.rotate(this.rotation);
      ctx.entity.fillRect(0, -2, 40, 4);
      ctx.entity.fillStyle = "white";
      ctx.entity.fillRect(0, -0.5, 40, 1);
      ctx.entity.restore();
    }
    update(ship) {
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
      this.destroyPod(ship);
      this.removeIfOutside();
    }
    removeIfOutside() {
      if (this.pos.x < 0 || this.pos.x > canvas.star1.width || this.pos.y < 0 || this.pos.y > canvas.star1.height) {
        this.remove();
      }
    }
    remove() {
      _Lazer.list = _Lazer.list.filter((l) => l != this);
    }
    destroyPod(ship) {
      Pod.list.forEach((asteroid) => {
        if (distance(this.pos, asteroid.drawPos) < asteroid.size / 2) {
          asteroid.destroyed = true;
          ship.score += asteroid.score;
          ship.showScore();
          this.remove();
        }
      });
    }
  };
  var Lazer = _Lazer;
  __publicField(Lazer, "list", []);

  // src/js/entities/SpaceShip.js
  var SpaceShip = class {
    constructor() {
      this.image = IMAGE.ship;
      this.size = { x: 100, y: 100 };
      this.pos = {
        x: canvas.entity.width / 2,
        y: canvas.entity.height / 2
      };
      this.vel = { x: 0.6, y: 0 };
      this.force = { x: 0, y: 0 };
      this.maximalForce = 0.48;
      this.friction = 0.98;
      this.rotation = 0;
      this.rotationVel = 0;
      this.rotationForce = 0;
      this.rotationMaximalForce = 0.07;
      this.rotationFriction = 0.01;
      this.status = "idle";
      this.frames = {
        idle: 0,
        boost_forwards: 1,
        boost_backwards: 2,
        turn_right: 3,
        turn_left: 4
      };
      this.destroyed = false;
      this.score = 0;
      this.alpha = 1;
      this.scoreDisplay = document.getElementById("scoreDisplay");
      this.podDisplay = document.getElementById("podDisplay");
      this.scoreDisplayEnd = document.getElementById("scoreDisplayEnd");
      this.errorScore = document.getElementById("errorScore");
      this.addControls();
    }
    update() {
      this.vel.x += this.force.x;
      this.vel.y += this.force.y;
      this.force.x = 0;
      this.force.y = 0;
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
      this.vel.x *= this.friction;
      this.vel.y *= this.friction;
      this.rotationVel += this.rotationForce;
      this.rotationForce = 0;
      this.rotation += this.rotationVel;
      this.rotationVel *= this.rotationFriction;
      if (this.destroyed) {
        this.alpha *= 0.95;
        if (this.alpha <= 0.01)
          this.alpha = 0;
      }
      this.handleTinyVel();
      this.boundToCanvas();
    }
    handleTinyVel(threshold = 0.01) {
      if (Math.abs(this.vel.x) < threshold) {
        this.vel.x = 0;
      }
      if (Math.abs(this.vel.y) < threshold) {
        this.vel.y = 0;
      }
      if (Math.abs(this.rotationVel) < threshold) {
        this.rotationVel = 0;
      }
    }
    boundToCanvas() {
      this.pos.x = Math.max(10, Math.min(canvas.entity.width, this.pos.x));
      this.pos.y = Math.max(10, Math.min(canvas.entity.height, this.pos.y));
    }
    draw() {
      ctx.entity.save();
      ctx.entity.globalAlpha = this.alpha;
      ctx.entity.translate(this.pos.x, this.pos.y);
      ctx.entity.rotate(this.rotation);
      ctx.entity.drawImage(this.image, this.frames[this.status] * this.size.x, 0, this.size.x, this.size.y, -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
      ctx.entity.restore();
    }
    showScore() {
      this.scoreDisplay.innerText = this.score;
      this.scoreDisplayEnd.innerText = `Kill: ${this.score}`;
    }
    showPods() {
      const show = () => {
        this.errorScore.innerText = Pod.errorScore;
        this.podDisplay.innerText = Pod.count ? Pod.count : 0;
      };
      show();
      setInterval(() => show(), 1e3);
    }
    addControls() {
      window.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "ArrowUp":
            this.boost({ direction: "forwards" });
            break;
          case "ArrowDown":
            this.boost({ direction: "backwards" });
            break;
          case "ArrowLeft":
            this.turn({ direction: "left" });
            break;
          case "ArrowRight":
            this.turn({ direction: "right" });
            break;
          case " ":
            this.shoot();
            break;
        }
      });
      window.addEventListener("keyup", (e) => {
        const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
        if (keys.includes(e.key)) {
          this.status = "idle";
        }
      });
    }
    shoot() {
      if (this.destroyed)
        return;
      new Lazer({
        pos: { ...this.pos },
        initialVel: { ...this.vel },
        rotation: this.rotation
      });
    }
    turn({ direction }) {
      if (this.destroyed)
        return;
      this.status = `turn_${direction}`;
      const sign = direction == "right" ? 1 : -1;
      this.rotationForce = sign * this.rotationMaximalForce;
    }
    boost({ direction }) {
      if (this.destroyed)
        return;
      this.status = `boost_${direction}`;
      const sign = direction == "forwards" ? 1 : -1;
      this.force = {
        x: sign * this.maximalForce * Math.cos(this.rotation),
        y: sign * this.maximalForce * Math.sin(this.rotation)
      };
    }
    reset() {
      this.score = 0;
      this.showScore();
      this.destroyed = false;
      this.status = "idle";
      this.rotation = 0;
      this.rotationVel = 0;
      this.vel = { x: 0, y: 0 };
      this.alpha = 1;
    }
  };

  // src/js/Stars.js
  var Stars = class {
    constructor() {
      this.sizes = ["1", "2", "3"];
      this.list = { 1: [], 2: [], 3: [] };
      this.number = { 1: 3e3, 2: 1e3, 3: 700 };
      this.parallax = { 1: 0.75, 2: 0.8, 3: 0.85 };
      this.alpha = { 1: 0.5, 2: 0.7, 3: 0.8 };
      this.color = "rgb(200, 179, 79)";
      this.scale = 1;
      this.scaleVel = 25e-5;
      this.updateCanvas({
        x: canvas.entity.width / 2,
        y: canvas.entity.height / 2
      });
    }
    generate() {
      for (const size of this.sizes) {
        this.list[size] = [];
        for (let i = 0; i < this.number[size]; i++) {
          const x = randInt(0, canvas[`star${size}`].width);
          const y = randInt(0, canvas[`star${size}`].height);
          this.list[size].push({ x, y });
        }
      }
    }
    draw() {
      for (const size of this.sizes) {
        clearCanvas(`star${size}`);
        ctx[`star${size}`].fillStyle = this.color;
        ctx[`star${size}`].globalAlpha = this.alpha[size];
        this.list[size].forEach(({ x, y }) => {
          ctx[`star${size}`].beginPath();
          ctx[`star${size}`].arc(x, y, size / 2, 0, 2 * Math.PI);
          ctx[`star${size}`].fill();
        });
      }
    }
    update(ship) {
      this.updateCanvas(ship.pos);
      this.updateScale();
    }
    updateScale() {
      this.scale += this.scaleVel;
      if (this.scale > 1.7 || this.scale < 1) {
        this.scaleVel *= -1;
      }
    }
    updateCanvas(pos) {
      for (const size of this.sizes) {
        const offset = {
          x: -this.parallax[size] * pos.x,
          y: -this.parallax[size] * pos.y
        };
        canvas[`star${size}`].style.transform = `translateX(${offset.x}px)translateY(${offset.y}px)scale(${this.scale})`;
      }
    }
  };

  // src/js/main.js
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
    window.addEventListener("resize", debounce(() => {
      makeCanvasesFullScreen();
      stars.generate();
      stars.draw();
    }, 150));
    function gameLoop() {
      clearCanvas("entity");
      [...Lazer.list, ...Pod.list, ship, stars].forEach((obj) => obj.update(ship));
      [...Lazer.list, ...Pod.list, ship].forEach((obj) => obj.draw());
      if (gameRunning)
        requestAnimationFrame(gameLoop);
    }
  });
})();
//# sourceMappingURL=bundle.js.map
