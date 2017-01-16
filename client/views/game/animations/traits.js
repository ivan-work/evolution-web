export const pingTrait = (done, traitId) => {
  const TraitHtml = document.getElementById('AnimalTrait' + traitId);
  if (TraitHtml) {
    TraitHtml.classList.add('Animate');
    setTimeout(() => {
      const TraitHtml = document.getElementById('AnimalTrait' + traitId);
      if (TraitHtml) TraitHtml.classList.remove('Animate');
      done();
    }, 500);
  } else {
    done();
  }
};

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
  console.log('TraitCarnivorous_End');

  Velocity(SourceAnimalHtml, {
    translateX: 0
    , translateY: 0
  }, 500)
    .then(() => {
      done();
    });
};

//export const TraitCooperation_Start = (done, {sourceAid, targetId}) => {
//  //pingTrait(done)
//};
//
//export const TraitCommunication_Start = (done, {sourceAid, targetId}) => {
//  const SourceAnimalHtml = document.getElementById('Animal' + sourceAid);
//  const TargetAnimalHtml = document.getElementById('Animal' + targetId);
//
//  Velocity(SourceAnimalHtml, {
//    translateX: 0
//    , translateY: -25
//  }, 1200)
//    .then(() => {
//      done();
//    })
//};
