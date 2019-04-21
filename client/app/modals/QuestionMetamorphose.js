import React, {Fragment} from 'react';
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import T from "i18n-react";
import TraitChooseList from "./TraitChooseList";
import {TraitMetamorphose} from "../../../shared/models/game/evolution/traitsData";
import {connect} from "react-redux";
import {closeDialog} from "../../actions/modal";
import {traitActivateRequest} from "../../../shared/actions/trait";

export const QuestionMetamorphose = ({game, trait, sourceAnimal, onSelectTrait}) => {
  const traits = TraitMetamorphose.getTargets(game, sourceAnimal, trait);
  return (
    <Fragment>
      <DialogTitle>{T.translate('Game.UI.TraitActivateDialog.Title')}</DialogTitle>
      <DialogContent>
        <TraitChooseList traits={traits} onSelectTrait={onSelectTrait}/>
      </DialogContent>
    </Fragment>
  );
};

export default connect(
  ({game}) => ({game})
  , (dispatch, {trait, sourceAnimal}) => ({
    onSelectTrait: (targetTraitId) => {
      if (!!targetTraitId) {
        dispatch(traitActivateRequest(sourceAnimal.id, trait.id, targetTraitId));
      }
      dispatch(closeDialog());
    }
  })
)(QuestionMetamorphose);