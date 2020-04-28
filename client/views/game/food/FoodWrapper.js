import React from "react";
import T from 'i18n-react';
import cn from "classnames";
import {compose} from "recompose";
import repeat from "lodash/times";

import AnimatedHOC from "../../../services/AnimationService/AnimatedHOC";

import {InteractiveFood} from "./Food";
import {InteractiveShell} from "./Shell";

import withStyles from "@material-ui/core/styles/withStyles";
import GameStyles from "../GameStyles";


export default compose(
  withStyles({
    root: {
      height: '100%'
      , overflow: 'hidden'
      , textAlign: 'center'
    }
    , title: {
      lineHeight: GameStyles.iconSize + 'px'
      , verticalAlign: 'top'
    }
  })
  , AnimatedHOC(() => `FoodContainer`)
)(
  ({classes, game}) => <div className={classes.root}>
    <span className={cn('h5', classes.title)}>
      {T.translate('Game.Icon.Food')}&nbsp;({Math.max(game.food, 0)})
      {game.food > 0 ? ': ' : ''}
    </span>
    {repeat(game.food, i => <InteractiveFood key={i} index={i}/>)}
    {game.getArea().shells.map((trait) => <InteractiveShell key={trait.id} trait={trait}/>).toList()}
  </div>
);