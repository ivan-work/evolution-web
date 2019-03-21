const defaultCardColor = '#F5F7F3';
const defaultWidth = 120;

const TraitColors = {
  TraitCarnivorous: "#900"
  , TraitSwimming: "#00F"
  , TraitRecombination: "#3AA"
  , TraitCommunication: "#99F"
  , TraitCooperation: "#090"
  , TraitSymbiosis: "#F06"
  , TraitParasite: "#909"
  , TraitFatTissue: "#d60"
  // , TraitFatTissue: "#FF0"
};

const addTraitColors = (property) => Object.entries(TraitColors)
  .reduce((result, [type, color]) =>
      Object.assign(result, {
        [`&.${type}`]: {
          [property]: color
        }
      })
    , {}
  );

export default {
  defaultCardColor
  , defaultWidth
  , card: {
    width: 90
    , height: 90 / 3 * 4
    , backgroundColor: defaultCardColor

    , borderRadius: 5
    , boxShadow: '1px 1px 5px black'
  }
  , animal: {
    width: defaultWidth
    // , minHeight: defaultWidth
    , height: defaultWidth / 3 * 4
    , backgroundColor: defaultCardColor

    , borderRadius: 5
    , boxShadow: '1px 1px 5px black'
  }
  , animalTrait: {
    textAlign: 'center'
    , background: defaultCardColor
    , borderTop: '1px solid #aaa'
  }
  , animalPreview: {
    width: 18
    , height: 24
    , background: defaultCardColor

    , borderRadius: 1
    , boxShadow: '1px 1px 2px black'
  }
  , addTraitColors
  , ellipsis: {
    whiteSpace: 'nowrap'
    , overflow: 'hidden'
    , textOverflow: 'ellipsis'
  }
}