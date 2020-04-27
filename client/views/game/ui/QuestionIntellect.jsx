import React from 'react';
import T from "i18n-react";
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'

import {branch, compose, renderNothing} from "recompose";
import {connect} from 'react-redux';
import withStyles from "@material-ui/core/styles/withStyles";

import {TraitIntellect} from '../../../../shared/models/game/evolution/traitsData/index';

import Typography from "@material-ui/core/Typography";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

import Dialog from "../../../app/modals/Dialog";
import {Timer} from "../../utils/Timer";
import {Animal} from "../animals/Animal";
import AnimalTraitChooseList from "./AnimalTraitChooseList";

import {traitAnswerRequest} from "../../../../shared/actions/trait";
import {QuestionRecord} from "../../../../shared/models/game/GameModel";

const styles = {
  content: {
    textAlign: 'center'
  }
  , animalWrapper: {
    display: 'inline-block'
  }
};

export const QuestionIntellect = (({classes, game, traitAnswerRequest}) => {
  const animal = game.locateAnimal(game.question.targetAid, game.question.targetPid);
  const traits = TraitIntellect.getTargets(game, game.question.sourceAid, game.question.targetAid);
  const checkTrait = trait => ~traits.indexOf(trait);
  const onClose = () => traitAnswerRequest(null);
  const onSelectTrait = (trait) => e => traitAnswerRequest(game.question.traitId, trait.id);
  const onSelectNothing = e => traitAnswerRequest(game.question.traitId, true);
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>{T.translate('Game.UI.TraitActivateDialog.Title')}</DialogTitle>
      <DialogContent className={classes.content}>
        <div className={classes.animalWrapper}>
          <Animal animal={animal}>
            <AnimalTraitChooseList
              traitList={animal.traits.toList()}
              checkTrait={checkTrait}
              onSelectTrait={onSelectTrait}
            />
          </Animal>
        </div>
        <Typography>
          <T.span text='Game.UI.TraitDefenceDialog.Time'/>:&nbsp;
          <Timer start={game.question.time} duration={game.settings.timeTraitResponse}/>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant='contained'
                color='primary'
                onClick={onSelectNothing}>
          {T.translate('Game.UI.TraitActivateDialog.Nothing')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default compose(
  withStyles(styles)
  , connect(
    ({game}) => ({game})
    , {traitAnswerRequest}
  )
  , branch(({game}) => !(game && game.question && game.question.id && game.question.type === QuestionRecord.INTELLECT), renderNothing)
)(QuestionIntellect);