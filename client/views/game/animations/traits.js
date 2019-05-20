export const pingTrait = (manager, traitId) => {
  const TraitHtml = manager.getAnimalTrait(traitId);
  if (!TraitHtml) return;
  TraitHtml.classList.add('Animate');
  return new Promise((resolve) => setTimeout(() => {
    const TraitHtml = manager.getAnimalTrait(traitId);
    if (TraitHtml) TraitHtml.classList.remove('Animate');
    resolve();
  }, 500));
};

export const TraitCarnivorous_Start = (manager, {sourceAid, targetId}) => {
  const SourceAnimalHtml = manager.getAnimal(sourceAid);

  return Velocity(SourceAnimalHtml, {
    translateX: 0
    , translateY: -30
  }, 500);
};

export const TraitCarnivorous_End = (manager, {sourceAid, targetId}) => {
  const SourceAnimalHtml = manager.getAnimal(sourceAid);

  return Velocity(SourceAnimalHtml, {
    translateX: 0
    , translateY: 0
  }, 250)
};


export const gameFoodTake_Start = (manager, {animalId}) => {
  const AnimalHtml = manager.getAnimal(animalId);

  if (AnimalHtml)
    return Velocity(AnimalHtml, {
      translateX: 0
      , translateY: -30
    }, 500);
};

export const gameFoodTake_End = (manager, {animalId}) => {
  const AnimalHtml = manager.getAnimal(animalId);

  if (AnimalHtml)
    return Velocity(AnimalHtml, {
      translateX: 0
      , translateY: 0
    }, 250)
};
