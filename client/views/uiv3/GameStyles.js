const defaultCardColor = '#F5F7F3';
const defaultWidth = 120;

export default {
  defaultCardColor
  , defaultWidth
  , card: {
    width: defaultWidth
    , height: defaultWidth / 3 * 4
    , background: defaultCardColor

    , borderRadius: 5
    , boxShadow: '1px 1px 5px black'
  }
  , animal: {
    width: defaultWidth
    // , minHeight: defaultWidth
    , height: defaultWidth / 3 * 4
    , background: defaultCardColor

    , borderRadius: 2
    , boxShadow: '1px 1px 5px black'
  }
  , animalTrait: {
    textAlign: 'center'
    , background: defaultCardColor
    , borderTop: '1px solid #aaa'
  }
  , animalPreview: {
    width: 24
    , height: 32
    , background: defaultCardColor

    , borderRadius: 1
    , boxShadow: '1px 1px 2px black'
  }
}