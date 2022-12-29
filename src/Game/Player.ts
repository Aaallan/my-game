import {
  ArcRotateCamera,
  KeyboardEventTypes,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  PhysicsImpostor,
  TargetCamera,
  Vector3,
} from "@babylonjs/core";
import { Game } from ".";
import { GameObject } from "./Types/GameObject";

export class Player extends GameObject {
  playerCam: TargetCamera;
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

    const playerShell = MeshBuilder.CreateCapsule(`playerShell`, {
      height: 1.8,
    });

    this.playerShell = playerShell;

    playerShell.position.y = 1.8;

    // testing gun
    const gun = MeshBuilder.CreateSphere(`gun`, {
      diameter: 0.3,
    });

    gun.parent = playerShell;

    gun.position = new Vector3(0, 1, 1);

    // testing material
    const _mat = new PBRMaterial(``);

    _mat.metallic = 0.1;

    playerShell.material = _mat;
    gun.material = _mat;

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
      40,
      playerShell.position.add(new Vector3(0, -5, 0))
    );

    this.playerCam = camera;

    camera.parent = playerShell;

    this.handleMovement();
  }

  handleMovement() {
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

  onTick() {
    const __this__ = this;

    const scene = __this__.scene;

    const playerImposter = __this__.playerShell.physicsImpostor!;

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

    playerImposter.setAngularVelocity(new Vector3().setAll(0));
  }

  destroy() {}
}
