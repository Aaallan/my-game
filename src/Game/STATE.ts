import { Observable } from "@babylonjs/core";
import { Environment } from "./Environment";
import { Player } from "./Player";

export class STATE {
  static environment: Environment;
  static player: Player;
}

export class EVENT_MANAGER {
  static onEnemyInit = new Observable();
}
