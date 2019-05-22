import React from "react";
import T from "i18n-react";
import cn from "classnames";

import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";

import WhiteTooltip from "../../utils/WhiteTooltip";

import AnimalTraitDetails from "../animals/AnimalTraitDetails";

import {TraitModel} from "../../../../shared/models/game/evolution/TraitModel";
import {compose, withProps} from "recompose";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import connect from "react-redux/es/connect/connect";
import {PHASE} from "../../../../shared/models/game/GameModel";
import {InteractionSource} from "../InteractionManager";
import {DND_ITEM_TYPE} from "../../game/dnd/DND_ITEM_TYPE";
import Card from "./Card";

const traitStyles = theme => ({
  CardTrait: {
    flex: 1
    , margin: 1
    , boxShadow: theme.shadows[2]
    , textAlign: 'center'
    , fontSize: 16
    , overflowWrap: 'break-word'
    , '&.canStart': {
      cursor: 'pointer'
    }
    , '&.canStart:hover, &.canStart:focus': {
      backgroundColor: theme.palette.grey.A100,
    }
  }
  , CardTraitText: {}
  , single: {}
  , double: {}
  , invert: {
    // transform: 'rotate(.5turn)'
  }
});

const CardTraitBody = ({classes, trait, single, double, invert, canStart, startInteraction}) => {
  const traitModel = TraitModel.new(trait);
  const traitFood = traitModel.getDataModel().food;
  return (
    <WhiteTooltip placement='top' title={<AnimalTraitDetails trait={traitModel}/>}>
      <Typography className={cn(classes.CardTrait, {
        [classes.single]: single
        , [classes.double]: double
        , [classes.invert]: invert
        , 'interactive': startInteraction
        , canStart
      })} onClick={startInteraction}>
        <span className={classes.CardTraitText + ' ' + trait}>
          <span className='name'>{T.translate('Game.Trait.' + trait)}</span>
          <span className='food'>{traitFood > 0 ? ' +' + traitFood : null}</span>
        </span>
      </Typography>
    </WhiteTooltip>
  );
};

const CardTrait = withStyles(traitStyles)(CardTraitBody);

export const InteractiveCardTrait = compose(
  connect(({game}) => ({
    canStart: (game.status.phase === PHASE.DEPLOY && game.isPlayerTurn()) || (game.status.phase === PHASE.REGENERATION)
  }))
  , InteractionSource(DND_ITEM_TYPE.CARD_TRAIT, {
    canStart: ({canStart}) => canStart
    , onStart: ({cardId, trait, invert}) => ({
      cardId: cardId
      , traitType: trait
      , alternateTrait: invert
      , help: 'Peretashite carty na zhivotne'
    })
  })
)(CardTrait);

export default CardTrait;