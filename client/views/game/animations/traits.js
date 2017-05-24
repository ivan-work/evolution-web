export const pingTrait = (traitId) => {
  const TraitHtml = document.getElementById('AnimalTrait' + traitId);
  if (!TraitHtml) return;
  TraitHtml.classList.add('Animate');
  return new Promise((resolve) => setTimeout(() => {
    const TraitHtml = document.getElementById('AnimalTrait' + traitId);
    if (TraitHtml) TraitHtml.classList.remove('Animate');
    resolve();
  }, 500));
};

export const TraitCarnivorous_Start = ({sourceAid, targetId}) => {
  const SourceAnimalHtml = document.getElementById('Animal' + sourceAid);
  const TargetAnimalHtml = document.getElementById('Animal' + targetId);
  // console.log('TraitCarnivorous_Start');

  return Velocity(SourceAnimalHtml, {
    translateX: 0
    , translateY: -30
  }, 500);
};

export const TraitCarnivorous_End = ({sourceAid, targetId}) => {
  const SourceAnimalHtml = document.getElementById('Animal' + sourceAid);
  const TargetAnimalHtml = document.getElementById('Animal' + targetId);
  // console.log('TraitCarnivorous_End');

  return Velocity(SourceAnimalHtml, {
    translateX: 0
    , translateY: 0
  }, 250)
};


export const gameFoodTake_Start = ({animalId}) => {
  const AnimalHtml = document.getElementById('Animal' + animalId);

  if (AnimalHtml)
    return Velocity(AnimalHtml, {
      translateX: 0
      , translateY: -30
    }, 500);
};

export const gameFoodTake_End = ({animalId}) => {
  const AnimalHtml = document.getElementById('Animal' + animalId);

  if (AnimalHtml)
    return Velocity(AnimalHtml, {
      translateX: 0
      , translateY: 0
    }, 250)
};
