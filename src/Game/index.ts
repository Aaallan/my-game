import { Engine, Scene } from "@babylonjs/core";
import "@babylonjs/inspector";
import * as CANNON from "cannon-es";
import { Environment } from "./Environment";
import { Player } from "./Player";

export class Game {
  engine: Engine;
  scene: Scene;

  constructor(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    this.engine = engine;
    this.scene = scene;

    window.CANNON = CANNON;

    scene.enablePhysics();

    if (window) {
      window.addEventListener("resize", this.resize);
    }

    this.start();
  }

  start() {
    const __this__ = this;

    new Environment(__this__);
    new Player(__this__);

    __this__.engine.runRenderLoop(() => {
      __this__.scene.render();
    });

    // this.scene.debugLayer.show({
    //   initialTab: 2,
    // });
  }

  destroy() {
    if (window) {
      window.removeEventListener("resize", this.resize);
    }

    this.scene.getEngine().dispose();
  }

  resize() {
    this.scene.getEngine().resize();
  }
}
