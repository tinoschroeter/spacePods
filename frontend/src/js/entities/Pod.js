import { canvas, ctx } from "../canvas.js";
import { distance, randInt, randEl } from "../helper.js";
import { IMAGE } from "../images.js";
import { showScreen } from "../screens.js";

export class Pod {
  static list = [];

  static SIZE = {
    s: 32,
    m: 64,
    l: 128,
  };

  static FRAME_COUNT = {
    s: 60,
    m: 60,
    l: 120,
  };

  static SCORE = {
    s: 5,
    m: 2,
    l: 1,
  };

  static interval = null;

  static removeAll() {
    Pod.list = [];
  }

  static startGenerating(frequency = 300) {
    Pod.interval = setInterval(() => new Pod(), frequency);
  }

  static stopGenerating() {
    clearInterval(Pod.interval);
  }

  constructor() {
    this.type = randEl(["s", "l", "m"]);
    const name = "asteroid-" + this.type;
    this.image = IMAGE[name];

    this.size = Pod.SIZE[this.type];

    const startSide = randEl(["left", "right", "top", "bottom"]);

    switch (startSide) {
      case "left":
        this.pos = {
          x: -this.size / 2,
          y: randInt(0, canvas.star1.height),
        };
        this.vel = { x: randInt(1, 4), y: randInt(-4, 5) };
        break;
      case "right":
        this.pos = {
          x: canvas.star1.width + this.size / 2,
          y: randInt(0, canvas.star1.height),
        };
        this.vel = { x: -randInt(1, 4), y: randInt(-4, 5) };
        break;
      case "top":
        this.pos = {
          x: randInt(0, canvas.star1.width),
          y: -this.size / 2,
        };
        this.vel = { x: randInt(-4, 5), y: randInt(1, 4) };
        break;
      case "bottom":
        this.pos = {
          x: randInt(0, canvas.star1.width),
          y: canvas.star1.height + this.size / 2,
        };
        this.vel = { x: randInt(-4, 5), y: -randInt(1, 4) };
        break;
    }
    this.animationTimer = 0;
    this.frameCount = Pod.FRAME_COUNT[this.type];
    this.parallax = 1;
    this.drawPos = { x: 0, y: 0 };
    this.destroyed = false;
    this.score = Pod.SCORE[this.type];
    Pod.list.push(this);
  }

  update(ship) {
    this.animationTimer++;
    if (this.animationTimer >= this.frameCount) this.animationTimer = 0;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.drawPos = {
      x: this.pos.x - this.parallax * ship.pos.x,
      y: this.pos.y - this.parallax * ship.pos.y,
    };
    if (this.destroyed) {
      this.vel = { x: 0, y: 0 };
      this.size *= 0.8;
      if (this.size <= 1) {
        this.remove();
      }
    }
    //this.destroyShip(ship);
    //this.removeIfOutside();
  }

  draw() {
    ctx.entity.save();
    ctx.entity.translate(this.drawPos.x, this.drawPos.y);
    ctx.entity.drawImage(
      this.image,
      this.animationTimer * Pod.SIZE[this.type],
      0,
      Pod.SIZE[this.type],
      Pod.SIZE[this.type],
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size
    );
    ctx.entity.restore();
  }
  removeIfOutside() {
    if (
      this.pos.x + this.size / 2 < 0 ||
      this.pos.y + this.size / 2 < 0 ||
      this.pos.x > canvas.star1.width + this.size / 2 ||
      this.pos.y > canvas.star1.height + this.size / 2
    ) {
      this.remove();
    }
  }

  remove() {
    Pod.list = Pod.list.filter((a) => a != this);
  }

  destroyShip(ship) {
    if (
      !ship.destroyed &&
      distance(ship.pos, this.drawPos) < ship.size.x / 2 + this.size / 2
    ) {
      ship.destroyed = true;
      ship.rotationForce = randEl([+1, -1]) * 0.2;
      showScreen("gameover");
    }
  }
}
