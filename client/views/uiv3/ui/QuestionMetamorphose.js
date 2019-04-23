import React, {Fragment} from 'react';
import T from "i18n-react";
import {compose} from "recompose";
import {connect} from "react-redux";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import withStyles from "@material-ui/core/styles/withStyles";

import {TraitMetamorphose} from "../../../../shared/models/game/evolution/traitsData/index";

import {traitActivateRequest} from "../../../../shared/actions/trait";
import {closeDialog} from "../../../actions/modal";

import {Animal} from "../animals/Animal";
import AnimalTraitChooseList from "./AnimalTraitChooseList";

const styles = {
  content: {
    textAlign: 'center'
  }
  , animalWrapper: {
    display: 'inline-block'
  }
};

export const QuestionMetamorphose = (({classes, game, data, traitActivateRequest, closeDialog}) => {
  const {trait, sourceAnimal} = data;
  const checkTrait = TraitMetamorphose.checkTarget.bind(null, game, sourceAnimal);
  const onSelectTrait = (targetTrait) => e => {
    if (!!targetTrait) {
      traitActivateRequest(sourceAnimal.id, trait.id, targetTrait.id);
    }
    closeDialog();
  };
  return (
    <Fragment>
      <DialogTitle>{T.translate('Game.UI.TraitActivateDialog.Title')}</DialogTitle>
      <DialogContent className={classes.content}>
        <div className={classes.animalWrapper}>
          <Animal animal={sourceAnimal}>
            <AnimalTraitChooseList
              traitList={sourceAnimal.traits.toList()}
              checkTrait={checkTrait}
              onSelectTrait={onSelectTrait}
            />
          </Animal>
        </div>
      </DialogContent>
    </Fragment>
  );
});

export default compose(
  withStyles(styles)
  , connect(
    ({game, modal}) => ({game, data: modal.data})
    , {closeDialog, traitActivateRequest}
  )
)(QuestionMetamorphose);