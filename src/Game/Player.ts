import {
  AnimationGroup,
  ArcRotateCamera,
  KeyboardEventTypes,
  Mesh,
  MeshBuilder,
  PhysicsImpostor,
  PointerEventTypes,
  Ray,
  RayHelper,
  SceneLoader,
  Space,
  TargetCamera,
  Tools,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { Game } from ".";
import { EVENT_MANAGER, STATE } from "./STATE";
import { GameObject } from "./Types/GameObject";
import { thickRayCast } from "./Util";

export class Player extends GameObject {
  static SPEED = 1 / 200;

  playerCam: TargetCamera;
  playerRoot: TransformNode;
  playerAvatar: TransformNode & {
    animationGroups: AnimationGroup[];
  };
  playerShell: Mesh;

  movementState = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
  };

  constructor(game: Game) {
    super(game);

    const scene = this.scene;

    const playerRoot = new TransformNode(`playerRoot`);
    const playerAvatar = new TransformNode(`playerAvatar`);

    this.playerRoot = playerRoot;

    const _playerAvatar = (this.playerAvatar = playerAvatar as any);

    playerAvatar.parent = playerRoot;

    const playerShell = MeshBuilder.CreateCapsule(`playerShell`, {
      height: 1.8,
    });

    this.playerShell = playerShell;

    playerShell.parent = playerRoot;

    playerShell.position.y = 1.8 / 2;
    playerShell.visibility = 0;

    SceneLoader.ImportMesh(
      ``,
      "./",
      "playerAvatar.glb",
      scene,
      function (meshes, particleSystems, skeletons, ags) {
        _playerAvatar.animationGroups = ags;

        meshes[0].parent = playerAvatar;

        playerAvatar.rotation.y = Tools.ToRadians(180);

        playerAvatar.scaling = new Vector3().setAll(3);

        ags.map((ag) => {
          if (ag.name === `Idle`) {
            ag.play(true);
          } else {
            ag.stop();
          }

          return true;
        });
      }
    );

    // testing material
    // const _mat = new PBRMaterial(``);

    // _mat.metallic = 0.1;

    // playerShell.material = _mat;

    // playerShell.physicsImpostor = new PhysicsImpostor(
    //   playerShell,
    //   PhysicsImpostor.BoxImpostor,
    //   { mass: 0, restitution: 0 },
    //   scene
    // );

    // https://doc.babylonjs.com/features/featuresDeepDive/cameras/camera_introduction#arc-rotate-camera
    const camera = new ArcRotateCamera(
      "playerCam",
      -Math.PI / 2,
      // Math.PI / 2.1,
      // -Math.PI,
      Math.PI / 5,
      30,
      playerRoot.position.add(new Vector3(0, 0, -5))
    );

    this.playerCam = camera;

    camera.parent = playerRoot;

    this.playerMovementKeypress();
    this.playerPointerEvent();

    STATE.player = this;
  }

  playerMovementKeypress() {
    const __this__ = this;

    const scene = this.scene;

    const playerImposter = __this__.playerShell.physicsImpostor!;

    scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.event.key.toLowerCase()) {
        case `w`:
        case `ArrowUp`:
          __this__.movementState.moveForward =
            kbInfo.type === KeyboardEventTypes.KEYDOWN;
          break;
        case `s`:
        case `ArrowDown`:
          __this__.movementState.moveBackward =
            kbInfo.type === KeyboardEventTypes.KEYDOWN;
          break;
        case `a`:
        case `ArrowLeft`:
          __this__.movementState.moveLeft =
            kbInfo.type === KeyboardEventTypes.KEYDOWN;
          break;
        case `d`:
        case `ArrowRight`:
          __this__.movementState.moveRight =
            kbInfo.type === KeyboardEventTypes.KEYDOWN;
          break;

        case ` `:
          if (
            kbInfo.type === KeyboardEventTypes.KEYDOWN &&
            Math.abs(playerImposter.getLinearVelocity()?.y || 0) < 0.1
          ) {
            __this__.movementState.jump = true;
          } else {
            __this__.movementState.jump = false;
          }
          break;
        default:
          break;
      }
    });
  }

  handleAimingMovement() {
    const __this__ = this;

    const scene = __this__.scene;

    const { pickedPoint } = scene.pick(
      scene.pointerX,
      scene.pointerY,
      (m) => m.isVisible && m.isEnabled() && m.isPickable
    );

    if (pickedPoint) {
      __this__.playerAvatar.lookAt(
        new Vector3(pickedPoint.x, 0, pickedPoint.z),
        undefined,
        undefined,
        undefined,
        Space.WORLD
      );

      return {
        pickedPoint: new Vector3(pickedPoint.x, 0, pickedPoint.z),
      };
    }

    return { pickedPoint: undefined };
  }

  playerPointerEvent() {
    const __this__ = this;

    const scene = this.scene;

    scene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
          __this__._fire.call(__this__);

          break;
      }
    });
  }

  _fire() {
    const __this__ = this;

    const scene = this.scene;

    const { pickedPoint } = __this__.handleAimingMovement.call(__this__);

    if (pickedPoint) {
      const PATH_WIDTH = 0.3;

      const pickingInfos = thickRayCast(__this__.playerAvatar, {
        thickness: PATH_WIDTH,
        localY: 0.1,
        predicate: (n) => {
          return (n as any).isEnemy;
        },
      });

      new Set<string>(
        pickingInfos
          .filter((pi) => {
            if (pi && pi.hit && pi.pickedMesh) {
              return true;
            }

            return false;
          })
          .map((pi) => {
            const enemyShell = pi?.pickedMesh!;

            return enemyShell.id;
          })
      ).forEach((enemyId) => {
        EVENT_MANAGER.onBulletHitEnemy.notifyObservers(enemyId);
      });
    }

    console.log(EVENT_MANAGER.onBulletHitEnemy.observers.length);
  }

  onTick() {
    const __this__ = this;

    const scene = __this__.scene;

    const playerImposter = __this__.playerShell.physicsImpostor!;
    const ags = __this__.playerAvatar.animationGroups;

    // if (__this__.movementState.jump) {
    //   playerImposter.applyImpulse(
    //     new Vector3(0, 1, 0),
    //     __this__.playerShell.getAbsolutePosition()
    //   );
    // }

    let direction = new Vector3().setAll(0);

    if (__this__.movementState.moveForward) {
      direction.addInPlace(new Vector3(0, 0, 1));
    }

    if (__this__.movementState.moveBackward) {
      direction.addInPlace(new Vector3(0, 0, -1));
    }

    if (__this__.movementState.moveLeft) {
      direction.addInPlace(new Vector3(-1, 0, 0));
    }

    if (__this__.movementState.moveRight) {
      direction.addInPlace(new Vector3(1, 0, 0));
    }

    const movement = direction.multiplyInPlace(
      new Vector3().setAll((scene.deltaTime || 0) * Player.SPEED)
    );

    __this__.playerRoot.position.addInPlace(movement);

    if (ags) {
      if (movement.equalsToFloats(0, 0, 0)) {
        ags.find((ag) => ag.name === `Run`)?.stop();
      } else {
        ags.find((ag) => ag.name === `Run`)?.play(true);
      }
    }

    // playerImposter.setAngularVelocity(new Vector3().setAll(0));

    this.handleAimingMovement();
  }

  destroy() {}
}
