import {
  CubeTexture,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  PhysicsImpostor,
} from "@babylonjs/core";
import { Game } from ".";
import { STATE } from "./STATE";
import { GameObject } from "./Types/GameObject";
import { createInnerPoints } from "./Util";

export class Environment extends GameObject {
  ground!: Mesh;

  constructor(game: Game) {
    super(game);

    this._createEnv();
    this._createGround();

    STATE.environment = this;
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

    this.ground = ground;

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

  getRandomPointOnGround() {
    return createInnerPoints(this.ground, 1)![0];
  }

  onTick() {}

  destroy() {}
}
