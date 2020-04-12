import logger from '../../../../utils/logger';
import * as ptt from "./plantTraitTypes";
import {TRAIT_ANIMAL_FLAG} from "../constants";

export default class PlantVisitor {
  visited = {};

  deathRow = [];

  mycoStack = [];

  mycoStackSurvive = false;

  constructor(game, log = false) {
    this.game = game;
    this.log = log;
  }

  visit = (plant) => {
    this.log && logger.debug(`PlantVisitor/${plant.id}/visit: ${!!this.visited[plant.id]}`);
    if (this.visited[plant.id]) return;

    this.visited[plant.id] = true;

    if (plant.hasFlag(TRAIT_ANIMAL_FLAG.POISONED)) {
      this.deathRow.push(plant.id);
      return;
    }

    if (plant.getFood() > 0) {
      this.log && logger.debug(`PlantVisitor/${plant.id}/mycoStack TRUE`);
      this.mycoStackSurvive = true;
    }

    this.log && logger.debug(`PlantVisitor/${plant.id}/mycoStack/PUSH (${this.mycoStack})|${this.mycoStackSurvive} ${plant.id}`);
    this.mycoStack.push(plant.id);
    plant.traits.forEach(trait => {
      if (trait.type === ptt.PlantTraitMycorrhiza) {
        const linkedPlant = this.game.getPlant(trait.linkAnimalId);
        this.visit(linkedPlant);
      }
    });

    this.log && logger.debug(`PlantVisitor/${plant.id}/check: ${!this.mycoStackSurvive} || ${!plant.data.surviveNoFood} || ${plant.getFood() === 0}`);
    if (!this.mycoStackSurvive && !plant.data.surviveNoFood && plant.getFood() === 0) {
      this.deathRow.push(plant.id);
    }

    if (this.mycoStack.length > 0) {
      if (this.mycoStack[this.mycoStack.length - 1] !== plant.id) {
        throw new Error(`MYCOSTACK ERROR: ${this.mycoStack} (${this.mycoStack[this.mycoStack.length - 1]})(${plant.id})`);
      }
      this.log && logger.debug(`PlantVisitor/${plant.id}/mycoStack/POP (${this.mycoStack})|${this.mycoStackSurvive} ${plant.id}`);
      this.mycoStack.pop();
    }

    if (this.mycoStack.length === 0) {
      this.log && logger.debug(`PlantVisitor/${plant.id}/mycoStack FALSE`);
      this.mycoStackSurvive = false;
    }
  };
}