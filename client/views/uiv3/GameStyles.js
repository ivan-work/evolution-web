import {lighten, darken} from '@material-ui/core/styles/colorManipulator'
import geckoHR from '../../assets/gfx/geckoHR.svg';
import * as tt from '../../../shared/models/game/evolution/traitTypes'

const defaultCardColor = '#F5F7F3';
const defaultWidth = 120;

const TraitGeneralColors = {
  Parasitic: '#909'
  , Fat: '#D60'
  , Attack: {
    text: '#600'
    , textActive: '#600'
    , fillActive: '#E99'
    , textActiveHover: '#FEE'
    , fillActiveHover: '#C33'
  }

  , text: '#000'
  , fill: '#FFF'
  , textActive: '#333'
  , fillActive: '#EFA'
  , textActiveHover: '#EFE'
  , fillActiveHover: '#060'
  , textValue: '#000'
  , fillValue: '#FC3'
  , textDisabled: '#333'
  , fillDisabled: '#999'
};

const defaultColorConfig = {
  text: TraitGeneralColors.Text
  , fill: TraitGeneralColors.fill
  , textActive: TraitGeneralColors.textActive
  , fillActive: TraitGeneralColors.fillActive
  , textActiveHover: TraitGeneralColors.textActiveHover
  , fillActiveHover: TraitGeneralColors.fillActiveHover
  , textValue: TraitGeneralColors.textValue
  , fillValue: TraitGeneralColors.fillValue
  , textDisabled: TraitGeneralColors.textDisabled
  , fillDisabled: TraitGeneralColors.fillDisabled
};

const TraitColors = {
  [tt.TraitCarnivorous]: TraitGeneralColors.Attack
  , [tt.TraitAnglerfish]: TraitGeneralColors.Attack
  , [tt.TraitSwimming]: {
    text: '#00F'
  }
  , [tt.TraitParasite]: {
    text: TraitGeneralColors.Parasitic
  }
  , [tt.TraitTrematode]: {
    text: TraitGeneralColors.Parasitic
  }
  , [tt.TraitNeoplasm]: {
    text: TraitGeneralColors.Parasitic
  }
  , [tt.TraitCommunication]: {
    text: '#99F'
  }
  , [tt.TraitCooperation]: {
    text: '#090'
  }
  , [tt.TraitSymbiosis]: {
    text: '#F06'
  }
  , [tt.TraitRecombination]: {
    text: '#3AA'
  }
  , [tt.TraitFatTissue]: {
    text: TraitGeneralColors.Fat
    , textValue: TraitGeneralColors.Fat
    , fillValue: '#FF0'
    , textActiveHover: '#FFE'
    , fillActiveHover: '#F60'
  }
  , 'AnimalTrait2': {}
};

const defaultMapper = ({text, fill}) => ({
  color: text
  , background: fill
});

const addTraitColors = (mapper = defaultMapper) => Object.entries(TraitColors)
  .reduce((result, [type, traitColorConfig]) => {
    const colorConfig = Object.assign({}, defaultColorConfig, traitColorConfig);
    return Object.assign(result, {
      [`&.${type}`]: mapper(colorConfig)
    })
  }, {});

const animalTrait = {
  textAlign: 'center'
  , width: defaultWidth - 2
  , height: 20
  , boxShadow: '1px 1px 2px #999'
  , margin: '0 1px 2px'
  // , borderTop: '1px solid #ccc'
  // , borderBottom: '1px solid #ccc'
  , boxSizing: 'border-box'
};

const animalBase = {
  minWidth: defaultWidth
  , height: (animalTrait.height + 2) * 8
  , margin: 10
  , borderRadius: 5
  , boxShadow: '1px 1px 5px black'
};
const animalCanInteract = {
  cursor: 'pointer'
  , boxShadow: `0px 0px 4px 4px #060`
  , '&:hover': {
    boxShadow: '0px 0px 4px 4px red'
  }
};
const animal = {
  ...animalBase
  , backgroundColor: defaultCardColor

  , display: 'flex'
  , flexFlow: 'column wrap'

  , background: `url(${geckoHR}) 0% 50% no-repeat`
  , backgroundSize: `${defaultWidth}px ${defaultWidth}px`

  , '&.canInteract': animalCanInteract
  , transition: 'box-shadow .25s'
};

export default {
  defaultCardColor
  , defaultWidth
  , defaultColorConfig
  , TraitColors
  , card: {
    width: 90
    , height: 90 / 3 * 4
    , backgroundColor: defaultCardColor

    , borderRadius: 5
    , boxShadow: '1px 1px 5px black'
  }
  , animalBase
  , animalCanInteract
  , animal
  , animalTrait
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