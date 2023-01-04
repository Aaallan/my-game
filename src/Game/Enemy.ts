import {
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  Tools,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { Game } from ".";
import { STATE } from "./STATE";
import { GameObject } from "./Types/GameObject";

export class Enemy extends GameObject {
  static enemyRootOrigin: TransformNode;

  static init(game: Game) {
    const scene = game.scene;

    const enemyRoot = new TransformNode(`enemyRoot_origin`);
    const enemyAvatar = new TransformNode(`enemyAvatar_origin`);

    enemyAvatar.parent = enemyRoot;

    const enemyShell = MeshBuilder.CreateCapsule(`enemyShell_origin`, {
      height: 1.8,
    });

    enemyShell.parent = enemyRoot;

    enemyShell.visibility = 0;
    enemyShell.position.y = 1.8 / 2;

    SceneLoader.ImportMesh(
      ``,
      "./",
      "enemyAvatar.glb",
      scene,
      function (meshes, particleSystems, skeletons, ags) {
        const _enemyAvatar = enemyAvatar as any;

        _enemyAvatar.animationGroups = ags;

        meshes[0].parent = enemyAvatar;

        enemyAvatar.rotation.y = Tools.ToRadians(180);

        enemyAvatar.scaling = new Vector3().setAll(3);

        ags.map((ag) => {
          if (ag.name === `Idle`) {
            ag.play(true);
          } else {
            ag.stop();
          }

          return true;
        });

        new Enemy(game);
        new Enemy(game);
        new Enemy(game);
      }
    );

    enemyRoot.setEnabled(false);

    Enemy.enemyRootOrigin = enemyRoot;
  }

  constructor(game: Game) {
    super(game);

    const scene = this.scene;

    const enemyInstance = Enemy.enemyRootOrigin.clone(``, null)!;

    const environment = STATE.environment;

    const spawnPoint = environment.getRandomPointOnGround();

    enemyInstance.position = spawnPoint;
  }

  handleAimingMovement() {
    const __this__ = this;

    const scene = __this__.scene;
  }

  onTick() {
    const __this__ = this;

    const scene = __this__.scene;

    this.handleAimingMovement();
  }

  destroy() {}
}
