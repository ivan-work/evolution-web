import {AT_LONG, AT_MEDIUM, AT_SHORT} from "./animations";

export const pingTrait = (manager, {traitId, traitType}) => {
  const TraitHtml = manager.getAnimalTrait(traitId);
  // console.log('pinging', traitType, traitId, TraitHtml);

  if (!TraitHtml) return;

  TraitHtml.classList.add('animation');

  return new Promise((resolve) => setTimeout(() => {
    const TraitHtml = manager.getAnimalTrait(traitId);
    if (TraitHtml) TraitHtml.classList.remove('animation');
    resolve();
  }, AT_MEDIUM));
};

export const TraitCarnivorous_Start = (manager, {sourceAid, targets}) => {
  const sourceAnimalHtml = manager.getAnimal(sourceAid);
  const targetAnimalHtml = manager.getAnimal(targets[0]);

  if (sourceAnimalHtml && targetAnimalHtml) {
    const sabbx = sourceAnimalHtml.getBoundingClientRect();
    const tabbx = targetAnimalHtml.getBoundingClientRect();

    let originX = sabbx.x;
    let originY = sabbx.y;

    if (sourceAnimalHtml.dataset.animated) {
      originX = sourceAnimalHtml.dataset.originX;
      originY = sourceAnimalHtml.dataset.originY;
    } else {
      sourceAnimalHtml.dataset.originX = originX;
      sourceAnimalHtml.dataset.originY = originY;
    }
    sourceAnimalHtml.dataset.animated = 'true';
    sourceAnimalHtml.classList.add('onTop');
    sourceAnimalHtml.classList.add('animation-stoppable');

    return Velocity(sourceAnimalHtml, {
      translateX: tabbx.x - originX
      , translateY: tabbx.y + tabbx.height - originY
    }, AT_MEDIUM)
      .then(() => {
        const sourceAnimalHtml = manager.getAnimal(sourceAid);
        if (sourceAnimalHtml) sourceAnimalHtml.classList.remove('animation-stoppable');
      });
  }
};

export const TraitCarnivorous_End = (manager, {sourceAid}) => {
  const sourceAnimalHtml = manager.getAnimal(sourceAid);

  if (sourceAnimalHtml) {
    sourceAnimalHtml.classList.remove('onTop');
    delete sourceAnimalHtml.dataset.animated;

    return Velocity(sourceAnimalHtml, {
      translateX: 0
      , translateY: 0
    }, AT_MEDIUM);
  }
};

export const TraitPiracy_Start = (manager, {sourceAid, targets}) => {
  const sourceAnimalHtml = manager.getAnimal(sourceAid);
  const targetAnimalHtml = manager.getAnimal(targets[0]);

  if (sourceAnimalHtml && targetAnimalHtml) {
    sourceAnimalHtml.classList.add('onTop');
    sourceAnimalHtml.classList.add('animation-stoppable');

    const sabbx = sourceAnimalHtml.getBoundingClientRect();
    const tabbx = targetAnimalHtml.getBoundingClientRect();

    return Velocity(sourceAnimalHtml, {
      translateX: tabbx.x - sabbx.x
      , translateY: tabbx.y + tabbx.height * .7 - sabbx.y
    }, AT_MEDIUM)
      .then(() => {
        const sourceAnimalHtml = manager.getAnimal(sourceAid);
        if (sourceAnimalHtml) sourceAnimalHtml.classList.remove('animation-stoppable');
      });
  }
};

export const TraitPiracy_End = (manager, {sourceAid}) => {
  const sourceAnimalHtml = manager.getAnimal(sourceAid);

  if (sourceAnimalHtml) {
    sourceAnimalHtml.classList.remove('onTop');

    return Velocity(sourceAnimalHtml, {
      translateX: 0
      , translateY: 0
    }, AT_SHORT);
  }
};