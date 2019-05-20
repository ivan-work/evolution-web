export default class AnimationManager {
  components = {};

  addComponent(name, html) {
    this.components[name] = html;
  }

  getComponent(name) {
    return this.components[name];
  }

  removeComponent(name, html) {
    delete this.components[name];
  }

  getFoodContainer() {
    return this.getComponent(`FoodContainer`);
  }

  getAnimal(animalId) {
    return this.getComponent(`Animal#${animalId}`);
  }

  getAnimalTrait(traitId) {
    return this.getComponent(`AnimalTrait#${traitId}`);
  }
}