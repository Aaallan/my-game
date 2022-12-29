import { Scene } from "@babylonjs/core";
import { Game } from "..";

export abstract class GameObject {
  _game: Game;
  scene: Scene;

  constructor(game: Game) {
    this._game = game;

    const scene = game.scene;
    this.scene = scene;
    this.scene = scene;

    scene.onBeforeRenderObservable.add(() => {
      this.onTick.call(this);
    });
  }

  abstract onTick(): void;
  abstract destroy(): void;
}
