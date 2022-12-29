import {
  ArcRotateCamera,
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

  constructor(game: Game) {
    super(game);

    const scene = this.scene;

    const playerShell = MeshBuilder.CreateCapsule(`playerShell`, {
      height: 1.8,
    });

    this.playerShell = playerShell;

    playerShell.position.y = 1.8;

    // testing material
    const _mat = new PBRMaterial(``);

    _mat.metallic = 0.1;

    playerShell.material = _mat;

    playerShell.physicsImpostor = new PhysicsImpostor(
      playerShell,
      PhysicsImpostor.SphereImpostor,
      { mass: 1, restitution: 0.5 },
      scene
    );

    const camera = new ArcRotateCamera(
      "playerCam",
      -Math.PI / 2,
      Math.PI / 5,
      35,
      playerShell.position
    );

    this.playerCam = camera;
  }

  onTick() {
    this.playerCam.setTarget(
      this.playerShell.position.add(new Vector3(0, -5, 0))
    );
  }

  destroy() {}
}
