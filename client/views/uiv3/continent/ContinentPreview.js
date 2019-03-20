import React from 'react';
import T from "i18n-react";
import {compose} from "recompose";
import {connect} from "react-redux";

import Typography from "@material-ui/core/Typography/Typography";
import withStyles from '@material-ui/core/styles/withStyles';

import GameStyles from "../GameStyles";
import {Scrollbars} from "react-custom-scrollbars";
import * as tt from '../../../../shared/models/game/evolution/traitTypes';
import stylesJson from '../../../stylesv3.json';

const styles = {
  continentPreview: {
    display: 'flex'
    , flexFlow: 'row wrap'
    , justifyContent: 'center'
    , overflow: 'hidden'
    // , alignItems: 'flex-start'
    // , margin: '0 auto'
    // , borderRadius: 2
    // , border: '1px solid #aaa'
  }
  , animalPreview: {
    ...GameStyles.animalPreview
    , margin: 2
    , flex: '0 0 auto'
    , overflow: 'hidden'
  }
  , animalPreviewToolbar: {
  }
  , animalPreviewTraitsContainer: {
  }
  , animalTraitPreview: {
    width: GameStyles.animalPreview.width
    , height: 5
    , borderBottom: '1px solid black'
  }
};

export const ContinentPreview = ({classes, game, player}) => (
  <div className={classes.continentPreview}>
    {player.continent
      .toList()
      .map(animal => <AnimalPreview key={animal.id} animal={animal}/>)}
  </div>
);

export const getAnimalPreviewColor = (animal) => {
  if (animal.hasTrait(tt.TraitCarnivorous, true)) {
    return stylesJson[tt.TraitCarnivorous];
  } else if (animal.hasTrait(tt.TraitSwimming, true)) {
    return stylesJson[tt.TraitSwimming];
  }
  return '#fff';
};

export const AnimalPreview = withStyles(styles)(({classes, animal}) => {
  const traitsList = animal.traits.toList();
  // const color = getAnimalPreviewColor(animal);
  return (
    <div className={classes.animalPreview}>
      <div className={classes.animalPreviewToolbar}>
      </div>
      <div className={classes.animalPreviewTraitsContainer}>
        {traitsList.map(trait => <AnimalTraitPreview key={trait.id} trait={trait}/>)}
      </div>
    </div>
  )
});

// export const getTraitPreviewColor = (animal) => {
//   if (animal.hasTrait(tt.TraitCarnivorous, true)) {
//     return stylesJson[tt.TraitCarnivorous];
//   } else if (animal.hasTrait(tt.TraitSwimming, true)) {
//     return stylesJson[tt.TraitSwimming];
//   }
//   return '#fff';
// };

export const AnimalTraitPreview = withStyles(styles)(({classes, trait}) => (
  <div className={`${classes.animalTraitPreview} ${trait.type}`}>
  </div>
));

export default compose(
  withStyles(styles)
  , connect((state, {playerId}) => {
    const game = state.get('game');
    const player = game.getPlayer(playerId);
    return {game, player}
  })
)(ContinentPreview);