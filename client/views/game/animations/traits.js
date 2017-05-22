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
    , translateY: -25
  }, 1200);
};

export const TraitCarnivorous_End = ({sourceAid, targetId}) => {
  const SourceAnimalHtml = document.getElementById('Animal' + sourceAid);
  const TargetAnimalHtml = document.getElementById('Animal' + targetId);
  // console.log('TraitCarnivorous_End');

  return Velocity(SourceAnimalHtml, {
    translateX: 0
    , translateY: 0
  }, 500)
};
