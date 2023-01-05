import { Observer, Scene } from "@babylonjs/core";
import { Game } from "..";

export abstract class GameObject {
  _game: Game;
  scene: Scene;
  _onTickObserver: Observer<Scene>;

  constructor(game: Game) {
    this._game = game;

    const scene = game.scene;
    this.scene = scene;

    this._onTickObserver = scene.onBeforeRenderObservable.add(() => {
      this.onTick.call(this);
    })!;
  }

  abstract onTick(): void;

  destroy() {
    this.scene.onBeforeRenderObservable.remove(this._onTickObserver);
  }
}
