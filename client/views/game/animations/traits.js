export const TraitCarnivorous_Start = (done, {sourceAid, targetId}) => {
  const SourceAnimalHtml = document.getElementById('Animal' + sourceAid);
  const TargetAnimalHtml = document.getElementById('Animal' + targetId);

  Velocity(SourceAnimalHtml, {
    translateX: 0
    , translateY: -25
  }, 1200)
    .then(() => {
      done();
    })
};

export const TraitCarnivorous_End = (done, {sourceAid, targetId}) => {
  const SourceAnimalHtml = document.getElementById('Animal' + sourceAid);
  const TargetAnimalHtml = document.getElementById('Animal' + targetId);

  Velocity(SourceAnimalHtml, {
    translateX: 0
    , translateY: 0
  }, 500)
    .then(() => {
      done();
    });
};