import { canvas, ctx } from "../canvas.js";
import { distance, randInt, randEl } from "../helper.js";
import { IMAGE } from "../images.js";
import { showScreen } from "../screens.js";

export class Pod {
  static list = [];

  static counts = 0;

  static api = "/api/pods";

  static SIZE = {
    m: 64,
    l: 128,
  };

  static FRAME_COUNT = {
    m: 60,
    l: 120,
  };

  static SCORE = {
    m: 1,
    l: 1,
  };

  static interval = null;

  static errorScore = 0;

  static removeAll() {
    Pod.list = [];
  }

  static startGenerating(frequency = 1000) {
    Pod.interval = setInterval(() => {
      fetch(Pod.api)
        .then((res) => res.json())
        .then((data) => {
          Pod.count = data.items.length;
          // data.items.forEach((item) =>
          //   console.log(`${item.metadata.name} ${item.status.phase}`)
          // );

          data.items.forEach((item) => new Pod(item.metadata.name));
        })
        .catch((e) => {
          Pod.errorScore++;
          console.error(e);
        });
    }, frequency);
  }

  static stopGenerating() {
    clearInterval(Pod.interval);
  }

  constructor(podName) {
    if (Pod.list.find((item) => item.podName === podName)) return;

    this.podName = podName;
    this.type = randEl(["l", "m"]);
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
        this.vel = { x: randInt(1, 3), y: randInt(-2, 4) };
        break;
      case "right":
        this.pos = {
          x: canvas.star1.width + this.size / 2,
          y: randInt(0, canvas.star1.height),
        };
        this.vel = { x: -randInt(1, 3), y: randInt(-2, 4) };
        break;
      case "top":
        this.pos = {
          x: randInt(0, canvas.star1.width),
          y: -this.size / 2,
        };
        this.vel = { x: randInt(-2, 4), y: randInt(1, 3) };
        break;
      case "bottom":
        this.pos = {
          x: randInt(0, canvas.star1.width),
          y: canvas.star1.height + this.size / 2,
        };
        this.vel = { x: randInt(-2, 4), y: -randInt(1, 3) };
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
    this.removeIfOutside();
  }

  draw() {
    //console.log(Pod.list)
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

    ctx.entity.fillStyle = "#FFA500";
    ctx.entity.font = "18px serif";
    ctx.entity.textAlign = "center";
    ctx.entity.fillText(this.podName, 0, 0);

    ctx.entity.restore();
  }
  removeIfOutside() {
    if (
      this.pos.x + this.size / 2 < 0 ||
      this.pos.y + this.size / 2 < 0 ||
      this.pos.x > canvas.star1.width + this.size / 2 ||
      this.pos.y > canvas.star1.height + this.size / 2
    ) {
      //console.log("Remove: ", this)
      this.remove();
    }
  }

  remove() {
    Pod.list = Pod.list.filter((pod) => pod != this);
  }

  static deletePod(podName) {
    fetch(`${Pod.api}/${podName}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((e) => {
        Pod.errorScore++;
        console.error(e);
      });
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
