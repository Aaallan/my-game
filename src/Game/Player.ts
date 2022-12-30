import {
  AnimationGroup,
  ArcRotateCamera,
  KeyboardEventTypes,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  PhysicsImpostor,
  SceneLoader,
  Space,
  TargetCamera,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { Game } from ".";
import "@babylonjs/loaders";
import { GameObject } from "./Types/GameObject";

export class Player extends GameObject {
  playerCam: TargetCamera;
  playerShell: Mesh;
  playerAvatar: TransformNode & {
    animationGroups: AnimationGroup[];
  };

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

    const playerShell = MeshBuilder.CreateCapsule(`playerShell`, {
      height: 1.8,
    });

    this.playerShell = playerShell;

    playerShell.position.y = 1.8;
    playerShell.visibility = 0;

    const playerAvatar = new TransformNode(`playerAvatar`);

    const _playerAvatar = (this.playerAvatar = playerAvatar as any);

    playerAvatar.parent = playerShell;

    SceneLoader.ImportMesh(
      ``,
      "./",
      "playerAvatar.glb",
      scene,
      function (meshes, particleSystems, skeletons, ags) {
        _playerAvatar.animationGroups = ags;

        meshes[0].parent = playerAvatar;

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
    const _mat = new PBRMaterial(``);

    _mat.metallic = 0.1;

    playerShell.material = _mat;

    playerShell.physicsImpostor = new PhysicsImpostor(
      playerShell,
      PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0 },
      scene
    );

    const camera = new ArcRotateCamera(
      "playerCam",
      -Math.PI / 2,
      Math.PI / 5,
      30,
      playerShell.position.add(new Vector3(0, 0, -5))
    );

    this.playerCam = camera;

    camera.parent = playerShell;

    this.playerMovementKeypress();
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
        new Vector3(
          pickedPoint.x,
          __this__.playerAvatar.absolutePosition.y,
          pickedPoint.z
        ),
        undefined,
        undefined,
        undefined,
        Space.WORLD
      );
    }
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
      new Vector3().setAll((scene.deltaTime || 0) / 200)
    );

    __this__.playerShell.position.addInPlace(movement);

    if (ags) {
      if (movement.equalsToFloats(0, 0, 0)) {
        ags.find((ag) => ag.name === `Run`)?.stop();
      } else {
        ags.find((ag) => ag.name === `Run`)?.play(true);
      }
    }

    playerImposter.setAngularVelocity(new Vector3().setAll(0));

    this.handleAimingMovement();
  }

  destroy() {}
}
