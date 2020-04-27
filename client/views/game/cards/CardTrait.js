import React from "react";
import T from "i18n-react";
import cn from "classnames";

import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";

import WhiteTooltip from "../../utils/WhiteTooltip";

import TraitDetails from "../traits/TraitDetails";

import {TraitModel} from "../../../../shared/models/game/evolution/TraitModel";
import {compose} from "recompose";
import {connect} from "react-redux";
import {PHASE} from "../../../../shared/models/game/GameModel";
import {InteractionSource} from "../InteractionManager";
import {InteractionItemType} from "../InteractionItemType";

const traitStyles = theme => ({
  CardTrait: {
    flex: 1
    , margin: 1
    , boxShadow: theme.shadows[2]
    , textAlign: 'center'
    , fontSize: 16
    , overflowWrap: 'break-word'
    , '&.canStart': {
      backgroundColor: theme.palette.game.allowed
      , cursor: 'pointer'
    }
    , '&.canStart:hover, &.canStart:focus': {
      backgroundColor: theme.palette.game.allowedHover
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
    <WhiteTooltip placement='top' title={<TraitDetails trait={traitModel}/>}>
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
  , InteractionSource(InteractionItemType.CARD_TRAIT, {
    canStart: ({canStart}) => canStart
    , onStart: ({cardId, trait, invert}) => ({
      cardId: cardId
      , traitType: trait
      , alternateTrait: invert
    })
  })
)(CardTrait);

export default CardTrait;