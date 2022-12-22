import geckoHR from '../../assets/gfx/geckoHR.svg';
import * as tt from '../../../shared/models/game/evolution/traitTypes'
import * as ptt from '../../../shared/models/game/evolution/plantarium/plantTraitTypes'

const defaultCardColor = '#F5F7F3';
const defaultWidth = 120;

const TraitGeneralColors = {
  Parasitic: {
    text: '#909'
    , stroke: '#909'
    , textActive: '#603'
    , fillActive: '#FCF'
    , textActiveHover: '#FEE'
    , fillActiveHover: '#909'
  }
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
  , textInteracting: '#F33'
  , fillInteracting: '#F33'
  , textCooldown: '#AAA'
  , fillCooldown: '#F33'
};

const defaultColorConfig = {
  text: TraitGeneralColors.text
  , fill: TraitGeneralColors.fill
  , stroke: TraitGeneralColors.text
  , textActive: TraitGeneralColors.textActive
  , fillActive: TraitGeneralColors.fillActive
  , textActiveHover: TraitGeneralColors.textActiveHover
  , fillActiveHover: TraitGeneralColors.fillActiveHover
  , textValue: TraitGeneralColors.textValue
  , fillValue: TraitGeneralColors.fillValue
  , textDisabled: TraitGeneralColors.textDisabled
  , fillDisabled: TraitGeneralColors.fillDisabled
  , textInteracting: TraitGeneralColors.textInteracting
  , fillInteracting: TraitGeneralColors.fillInteracting
  , textCooldown: TraitGeneralColors.textCooldown
  , fillCooldown: TraitGeneralColors.fillCooldown
};

const TraitColors = {
  [tt.TraitCarnivorous]: TraitGeneralColors.Attack
  , [tt.TraitAnglerfish]: TraitGeneralColors.Attack
  , [tt.TraitAggression]: TraitGeneralColors.Attack
  , [tt.TraitCannibalism]: TraitGeneralColors.Attack
  , [tt.TraitIntellect]: TraitGeneralColors.Attack
  , [tt.TraitVoracious]: TraitGeneralColors.Attack
  , [tt.TraitSwimming]: {text: '#00F'}
  , [tt.TraitParasite]: TraitGeneralColors.Parasitic
  , [tt.TraitTrematode]: TraitGeneralColors.Parasitic
  , [tt.TraitNeoplasm]: TraitGeneralColors.Parasitic
  , [tt.TraitFlea]: TraitGeneralColors.Parasitic
  , [tt.TraitParalysis]: TraitGeneralColors.Parasitic
  , [tt.TraitPest]: TraitGeneralColors.Parasitic
  , [tt.TraitCommunication]: {
    text: '#99F'
    , stroke: '#99F'
  }
  , [tt.TraitCooperation]: {
    text: '#090'
    , stroke: '#090'
  }
  , [tt.TraitSymbiosis]: {
    text: '#F06'
    , stroke: '#F06'
    , textSource: '#FFF'
    , fillSource: '#FAA'
  }
  , [tt.TraitRecombination]: {
    text: '#3AA'
    , stroke: '#3AA'
  }
  , [tt.TraitFatTissue]: {
    text: TraitGeneralColors.Fat
    , textValue: TraitGeneralColors.Fat
    , fillValue: '#FF0'
    , textActiveHover: '#FFE'
    , fillActiveHover: '#F60'
  }
  , [ptt.PlantTraitAquatic]: {
    text: '#00F'
  }
  , [ptt.PlantTraitParasiticLink]: TraitGeneralColors.Parasitic
  , [ptt.PlantTraitParasiticPlant]: TraitGeneralColors.Parasitic
  , [ptt.PlantTraitHiddenCarnivorous]: TraitGeneralColors.Attack
  , [ptt.PlantTraitMycorrhiza]: {
    text: '#396'
    , stroke: '#396'
  }
  , [tt.TraitSpecialization]: {
    text: '#396'
    , stroke: 'rgba(111, 211, 111, .77)'
  }
};
TraitColors.Trait = {}; // default mapping

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

const gridContainerBase = {
  display: 'flex'
  , margin: '4px auto'
  , flexFlow: 'row wrap'
  , justifyContent: 'center'
  , alignContent: 'start'
  , alignItems: 'flex-start'

};

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
  , height: 20 + animalTrait.height * 8
  , margin: 10
  , borderRadius: 5
  , boxShadow: '1px 1px 5px black'
};

const canInteract = {
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

  , '&.canInteract': canInteract
  , transition: 'box-shadow .25s'
};

const plant = {
  ...animalBase
  , height: 'auto'
  , '&.canInteract': canInteract
};

export default {
  defaultCardColor
  , defaultWidth
  , defaultColorConfig
  , TraitColors
  , gridContainerBase
  , iconSize: 32
  , card: {
    width: 90
    , height: 90 / 3 * 4
    , backgroundColor: defaultCardColor

    , borderRadius: 5
    , boxShadow: '1px 1px 5px black'
  }
  , animalBase
  , animalCanInteract: canInteract
  , animal
  , animalTrait
  , plant
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