import logger from '../../../../utils/logger';
import * as ptt from "./plantTraitTypes";

export default class ParasiteVisitor {
  visited = {};

  deathRow = [];

  constructor(game, log = false) {
    this.game = game;
    this.log = log;
  }

  visit = (plant) => {
    this.log && logger.debug(`ParasiteVisitor/${plant.id}/visit: ${!!this.visited[plant.id]}`);

    if (this.visited[plant.id]) return;

    this.visited[plant.id] = true;

    this.deathRow.push(plant.id);

    plant.traits.forEach(trait => {
      if (trait.type === ptt.PlantTraitParasiticLink && !trait.linkSource) {
        const linkedPlant = this.game.getPlant(trait.linkAnimalId);
        this.visit(linkedPlant);
      }
    });
  };
}