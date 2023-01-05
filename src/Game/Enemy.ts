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
  ActionManager,
  ExecuteCodeAction,
  InstantiatedEntries,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { nanoid } from "nanoid";
import { Game } from ".";
import { Player } from "./Player";
import { EVENT_MANAGER, STATE } from "./STATE";
import { GameObject } from "./Types/GameObject";

export class Enemy extends GameObject {
  static enemyAssetContainer: AssetContainer;
  static enemies = new Map<string, Enemy>();

  id: string;
  enemyRoot: TransformNode;
  enemyAvatar: TransformNode & {
    animationGroups: AnimationGroup[];
  };
  enemyShell: Mesh;
  enemyInstantiatedEntries: InstantiatedEntries;

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
        if (Enemy.enemies.size < 2) {
          new Enemy(game);
        }

        Enemy._spawn(game);
      },
    });
  }

  constructor(game: Game) {
    super(game);

    const scene = this.scene;

    const id = (this.id = nanoid());

    const container = (this.enemyInstantiatedEntries =
      Enemy.enemyAssetContainer.instantiateModelsToScene(
        (sn) => `${sn}_${id}`,
        false,
        {
          doNotInstantiate: true,
        }
      ));

    const {
      rootNodes: [rootNode],
      animationGroups: ags,
    } = container;

    const enemyRoot = (this.enemyRoot = new TransformNode(`enemyRoot_${id}`));
    this.enemyAvatar = new TransformNode(`enemyAvatar_${id}`) as any;

    this.enemyAvatar.animationGroups = ags;

    this.enemyAvatar.parent = enemyRoot;
    rootNode.parent = this.enemyAvatar;

    const enemyShell = (this.enemyShell = MeshBuilder.CreateCapsule(
      `enemyShell_${id}`,
      {
        height: 1.8,
      }
    ));

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

      return true;
    });

    Enemy.enemies.set(id, this);

    this._handlePlayerIntersect();
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
      .subtract(__this__.enemyRoot.absolutePosition)
      .normalize();

    const movement = direction.multiplyInPlace(
      new Vector3().setAll(((scene.deltaTime || 0) * Player.SPEED) / 3)
    );

    __this__.enemyRoot.position.addInPlace(movement);

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

  _handlePlayerIntersect() {
    const __this__ = this;

    const scene = __this__.scene;

    const { playerShell } = STATE.player;

    const am = new ActionManager(scene);

    am.registerAction(
      new ExecuteCodeAction(
        {
          trigger: ActionManager.OnIntersectionEnterTrigger,
          parameter: playerShell,
        },
        () => {
          __this__.destroy.call(__this__);
        }
      )
    );

    __this__.enemyShell.actionManager = am;
  }

  destroy() {
    super.destroy();

    const { rootNodes, skeletons, animationGroups } =
      this.enemyInstantiatedEntries;

    rootNodes.map((n) => {
      n.dispose();

      return true;
    });

    skeletons.map((n) => {
      n.dispose();

      return true;
    });

    animationGroups.map((n) => {
      n.dispose();

      return true;
    });

    this.enemyRoot.dispose();
    this.enemyAvatar.dispose();
    this.enemyShell.dispose();

    Enemy.enemies.delete(this.id);
  }
}
