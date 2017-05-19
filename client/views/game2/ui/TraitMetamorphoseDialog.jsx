import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'

import {TraitMetamorphose} from '../../../../shared/models/game/evolution/traitsData';

import TraitActivateDialog from '../../game/ui/TraitActivateDialog.jsx'

export const TraitMetamorphoseDialogView = ({game, metamorphoseQuestion}) => {
  const {animal, trait, onSelectTrait} = metamorphoseQuestion;
  const traits = !trait ? null
    : TraitMetamorphose.getTargets(game, animal, trait);
  return <TraitActivateDialog game={game} traits={traits} onSelectTrait={onSelectTrait}/>;
};

TraitMetamorphoseDialogView.propTypes = {
  game: PropTypes.object.isRequired
  , metamorphoseQuestion: PropTypes.object.isRequired
};

export default TraitMetamorphoseDialogView;