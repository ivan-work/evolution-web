import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import {connect} from 'react-redux';

import {TraitIntellect} from '../../../../shared/models/game/evolution/traitsData';
import {QuestionRecord} from '../../../../shared/models/game/GameModel.js';

import TraitActivateDialog from '../ui/TraitActivateDialog.jsx'

export const TraitIntellectDialogView = connect(
  (state, {game, $traitAnswer}) => {
    const returnProps = {game};
    if (game.question && game.question.id && game.question.type === QuestionRecord.INTELLECT) {
      returnProps.traits = TraitIntellect.getTargets(game, game.question.sourceAid, game.question.targetAid);
      returnProps.onSelectTrait = (targetId) => $traitAnswer(game.question.traitId, targetId);
    }
    return returnProps;
  }
)(({game, traits, onSelectTrait}) => <TraitActivateDialog game={game} traits={traits} onSelectTrait={onSelectTrait} allowNothing/>);

TraitIntellectDialogView.propTypes = {
  game: PropTypes.object.isRequired
};

export default TraitIntellectDialogView;