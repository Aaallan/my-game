import {
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  Tools,
  TransformNode,
  Vector3,
  setAndStartTimer,
  Space,
  AnimationGroup,
  AssetContainer,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { Game } from ".";
import { Player } from "./Player";
import { EVENT_MANAGER, STATE } from "./STATE";
import { GameObject } from "./Types/GameObject";

export class Enemy extends GameObject {
  static enemyAssetContainer: AssetContainer;
  static enemies: Enemy[] = [];

  static init(game: Game) {
    const scene = game.scene;

    SceneLoader.LoadAssetContainer(
      "./",
      "enemyAvatar.glb",
      scene,
      (container) => {
        Enemy.enemyAssetContainer = container;

        EVENT_MANAGER.onEnemyInit.notifyObservers(container);
      }
    );

    EVENT_MANAGER.onEnemyInit.addOnce(() => {
      Enemy._spawn(game);
    });
  }

  static _spawn(game: Game) {
    const scene = game.scene;

    setAndStartTimer({
      timeout: 1000 * 3,
      contextObservable: scene.onBeforeRenderObservable,
      onEnded: () => {
        if (Enemy.enemies.length < 2) {
          new Enemy(game);
        }

        Enemy._spawn(game);
      },
    });
  }

  enemyRoot: TransformNode;
  enemyAvatar: TransformNode & {
    animationGroups: AnimationGroup[];
  };

  constructor(game: Game) {
    super(game);

    const scene = this.scene;

    const {
      rootNodes: [rootNode],
      animationGroups: ags,
    } = Enemy.enemyAssetContainer.instantiateModelsToScene(undefined, false, {
      doNotInstantiate: true,
    });

    const enemyRoot = (this.enemyRoot = new TransformNode(`enemyRoot`));
    this.enemyAvatar = new TransformNode(`enemyAvatar`) as any;

    this.enemyAvatar.animationGroups = ags;

    this.enemyAvatar.parent = enemyRoot;
    rootNode.parent = this.enemyAvatar;

    const enemyShell = MeshBuilder.CreateCapsule(`enemyShell`, {
      height: 1.8,
    });

    enemyShell.parent = enemyRoot;

    enemyShell.visibility = 0;
    enemyShell.position.y = 1.8 / 2;

    const environment = STATE.environment;

    const spawnPoint = environment.getRandomPointOnGround();

    enemyRoot.position = spawnPoint;

    this.enemyAvatar.rotation.y = Tools.ToRadians(180);

    this.enemyAvatar.scaling = new Vector3().setAll(3);

    ags.map((ag) => {
      if (ag.name.includes(`Idle`)) {
        ag.play(true);
      } else {
        ag.stop();
      }
    });

    Enemy.enemies.push(this);
  }

  handleMovement() {
    const __this__ = this;

    const scene = __this__.scene;

    const { playerRoot } = STATE.player;

    const playerPos = playerRoot.absolutePosition;

    const ags = (__this__.enemyAvatar as any)
      .animationGroups as AnimationGroup[];

    __this__.enemyAvatar.lookAt(
      playerPos,
      undefined,
      undefined,
      undefined,
      Space.WORLD
    );

    const direction = playerPos
      .subtract(__this__.enemyAvatar.absolutePosition)
      .normalize();

    const movement = direction.multiplyInPlace(
      new Vector3().setAll(((scene.deltaTime || 0) * Player.SPEED) / 3)
    );

    __this__.enemyAvatar.position.addInPlace(movement);

    if (ags) {
      if (movement.equalsToFloats(0, 0, 0)) {
        ags.find((ag) => ag.name.includes(`Walk`))?.stop();
      } else {
        ags.find((ag) => ag.name.includes(`Walk`))?.play(true);
      }
    }
  }

  onTick() {
    const __this__ = this;

    const scene = __this__.scene;

    this.handleMovement();
  }

  destroy() {}
}
