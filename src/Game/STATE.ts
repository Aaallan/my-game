import { Observable } from "@babylonjs/core";
import { Environment } from "./Environment";

export class STATE {
  static environment: Environment;
}

export class EVENT_MANAGER {
  static onEnemyInit = new Observable();
}
