import React from "react";
import T from "i18n-react";
import cn from "classnames";

import Typography from "@material-ui/core/Typography/Typography";
import withStyles from "@material-ui/core/styles/withStyles";

import Tooltip from "../../utils/WhiteTooltip";

import AnimalTraitDetails from "../animals/AnimalTraitDetails";

import {TraitModel} from "../../../../shared/models/game/evolution/TraitModel";

const traitStyles = theme => ({
  trait: {
    flex: 1
    , textAlign: 'center'
    , fontSize: 16
  }
  , single: {

  }
  , double: {
  }
  , invert: {
    transform: 'rotate(.5turn)'
  }
});

const CardTrait = ({classes, trait, single, double, invert}) => (
  <Tooltip placement='top' title={<AnimalTraitDetails trait={TraitModel.new(trait)}/>}>
    <Typography className={cn({
      [classes.trait]: true
      , [classes.single]: single
      , [classes.double]: double
      , [classes.invert]: invert
    })}>
      <span className={trait}>{T.translate('Game.Trait.' + trait)}</span>
    </Typography>
  </Tooltip>
);

export default withStyles(traitStyles)(CardTrait);