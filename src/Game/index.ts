import { Engine, Scene } from "@babylonjs/core";

export class Game {
  scene: Scene;

  constructor(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    this.scene = scene;

    if (window) {
      window.addEventListener("resize", this.resize);
    }

    engine.runRenderLoop(() => {
      scene.render();
    });
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
