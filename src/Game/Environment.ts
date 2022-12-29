import {
  CubeTexture,
  MeshBuilder,
  PBRMaterial,
  PhysicsImpostor,
} from "@babylonjs/core";
import { Game } from ".";
import { GameObject } from "./Types/GameObject";

export class Environment extends GameObject {
  constructor(game: Game) {
    super(game);

    this._createEnv();
    this._createGround();
  }

  _createEnv() {
    const __this__ = this;

    const scene = __this__.scene;

    const envTex = new CubeTexture(
      "https://assets.babylonjs.com/environments/environmentSpecular.env",
      scene
    );

    scene.environmentTexture = envTex;

    const skyBox = scene.createDefaultSkybox(envTex, true, 500)!;

    skyBox.name = `skybox`;
    skyBox.material!.name = `skyboxMat`;
    (skyBox!.material as PBRMaterial).microSurface = 0.7;
  }

  _createGround() {
    const ground = MeshBuilder.CreateGround(`ground`, {
      width: 50,
      height: 30,
    });

    const gorundMat = new PBRMaterial(`groundMat`);

    gorundMat.metallic = 0.1;

    ground.material = gorundMat;

    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.9 },
      this.scene
    );
  }

  onTick() {}

  destroy() {}
}
