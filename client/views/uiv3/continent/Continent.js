import React, {Fragment} from 'react';
import T from "i18n-react";
import {compose} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';
import repeat from 'lodash/times';

import GameStyles from "../GameStyles";
import Typography from "@material-ui/core/Typography/Typography";
import {Scrollbars} from 'react-custom-scrollbars';

import geckoHR from '../../../assets/gfx/geckoHR.svg';
import IconFood from "@material-ui/icons/Spa";
import {PHASE} from "../../../../shared/models/game/GameModel";
import {TRAIT_ANIMAL_FLAG} from "../../../../shared/models/game/evolution/constants";

import IconFull from '@material-ui/icons/SentimentVerySatisfied';
import IconEnough from '@material-ui/icons/SentimentSatisfied';
import IconHungry from '@material-ui/icons/SentimentVeryDissatisfied';

import IconFlagPoisoned from '@material-ui/icons/SmokingRooms';
import IconFlagHibernated from '@material-ui/icons/Snooze';
import IconFlagShell from '@material-ui/icons/Home';
import IconFlagRegeneration from '@material-ui/icons/GetApp';
import IconFlagShy from '@material-ui/icons/Report';
import Food from "../food/Food";

const styles = {
  continent: {
    display: 'flex'
    , margin: '4px auto'
    , flexFlow: 'row wrap'
    , justifyContent: 'center'
    , alignContent: 'start'
    , minWidth: (GameStyles.defaultWidth + 20) * 3
    , minHeight: (GameStyles.animal.height + 20)
    , alignItems: 'flex-start'
  }
  , animal: {
    ...GameStyles.animal
    , display: 'flex'
    , flexFlow: 'column wrap'
    // , justifyContent: 'flex-end'
    , margin: 10
    , background: `url(${geckoHR}) 0% 50% no-repeat`
    , backgroundSize: `${GameStyles.defaultWidth}px ${GameStyles.defaultWidth}px`
  }
  , animalToolbar: {
    textAlign: 'center'
    , height: 44
    , maxWidth: GameStyles.animal.minWidth
    , lineHeight: 0
    // , justifySelf: 'flex-start'
  }
  , animalTraitsContainer: {
    alignSelf: 'flex-end'
  }
  , animalTraitsContainerInner: {
    alignSelf: 'flex-end'
    // , display: 'flex'
    // , flexFlow: 'column wrap'
    // , overflowX: 'hidden'
  }
  , trait: {
    ...GameStyles.animalTrait
    // , display: 'inline-block'
    // , float: 'left'
  }
  , traitText: {
    fontSize: 14
    , ...GameStyles.addTraitColors('color')
    , display: 'flex'
    , '& .name': {
      ...GameStyles.ellipsis
      , flex: '1 1 0'
    }
  }
  , animalFood: {}
};

export const Continent = ({classes, game, player}) => (
  <div className={classes.continent}>
    {player.continent
      .toList()
      .map(animal => <Animal key={animal.id} game={game} animal={animal}/>)}
  </div>
);

export const renderAnimalFoodStatus = animal => (
  animal.isFull() ? <IconFull/>
    : animal.canSurvive() ? <IconEnough/>
    : <IconHungry/>
);

export const renderAnimalFood = animal => {
  const food = animal.getFoodAndFat();
  if (food < 4) {
    return repeat(food, (_, i) => <Food key={i}/>);
  } else {
    return <span><Typography inline style={{
      fontWeight: 700,
      fontSize: 24,
      lineHeight: 0,
      verticalAlign: 'middle'
    }}>{food}</Typography><Food/></span>
  }
};

const calcWidth = (e) => {
  if (e) {
    if (e.children.length > (1 + 6 + 8 + 8)) {
      e.style.width = GameStyles.defaultWidth * 4 + 'px'
    } else if (e.children.length > (1 + 6 + 8)) {
      e.style.width = GameStyles.defaultWidth * 3 + 'px'
    } else if (e.children.length > (1 + 6)) {
      e.style.width = GameStyles.defaultWidth * 2 + 'px'
    }
  }
};

export const Animal = withStyles(styles)(({classes, animal, game}) => (
  <div className={classes.animal} ref={calcWidth}>
    {/*<div className={'magic ' + classes.columnWidthHack}/>*/}
    <div className={classes.animalToolbar}>
      <div>
        {/*{renderAnimalFood(animal)}*/}
        {game && game.status.phase === PHASE.FEEDING && renderAnimalFoodStatus(animal)}
        {game && game.status.phase === PHASE.FEEDING && renderAnimalFood(animal)}
      </div>
      <div>
        {animal.hasFlag(TRAIT_ANIMAL_FLAG.POISONED) && <IconFlagPoisoned className='Flag Poisoned'/>}
        {animal.hasFlag(TRAIT_ANIMAL_FLAG.HIBERNATED) && <IconFlagHibernated className='Flag Hibernated'/>}
        {animal.hasFlag(TRAIT_ANIMAL_FLAG.SHELL) && <IconFlagShell className='Flag Shell'/>}
        {animal.hasFlag(TRAIT_ANIMAL_FLAG.REGENERATION) && <IconFlagRegeneration className='Flag Regeneration'/>}
        {animal.hasFlag(TRAIT_ANIMAL_FLAG.SHY) && <IconFlagShy className='Flag Shy'/>}
        {/*{<IconFlagPoisoned className='Flag Poisoned'/>}*/}
        {/*{<IconFlagHibernated className='Flag Hibernated'/>}*/}
        {/*{<IconFlagShell className='Flag Shell'/>}*/}
        {/*{<IconFlagRegeneration className='Flag Regeneration'/>}*/}
        {/*{<IconFlagShy className='Flag Shy'/>}*/}
      </div>
    </div>
    {/*<Scrollbars*/}
    {/*className={classes.animalTraitsContainer}*/}
    {/*autoHeight*/}
    {/*autoHeightMin={0}*/}
    {/*autoHeightMax={110}>*/}
    {/*<div className={classes.animalTraitsContainerInner}>*/}
    {animal.traits.toList().map(trait => <Trait key={trait.id} trait={trait}/>)}
    {/*</div>*/}
    {/*</Scrollbars>*/}
  </div>
));

export const Trait = withStyles(styles)(({classes, trait}) => (
  <div className={`trait ${classes.trait}`}>
    <Typography className={`${classes.traitText} ${trait.type}`}>
      <span className='name'>{T.translate('Game.Trait.' + trait.type)}</span>
      <span className='food'>{trait.getDataModel().food > 0 ? ' +' + trait.getDataModel().food : null}</span>
    </Typography>
  </div>
));

export default compose(
  withStyles(styles)
  , connect((state, {playerId}) => {
    const game = state.get('game');
    const player = game.getPlayer(playerId);
    return {game, player}
  })
)(Continent);