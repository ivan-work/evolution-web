import React, {Fragment} from 'react';
import T from "i18n-react";

import {compose} from "recompose";
import {connect} from "react-redux";
import withStyles from "@material-ui/core/styles/withStyles";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

import IconArrowRight from "@material-ui/icons/ArrowForward";
import IconArrowLeft from "@material-ui/icons/ArrowBack";

import AnimalTraitChooseList from "./AnimalTraitChooseList";

import GameStyles from "../GameStyles";

import * as tt from "../../../../shared/models/game/evolution/traitTypes";

import {Animal} from "../animals/Animal";
import {AnimalTraitBase} from "../animals/AnimalTrait";

import {closeDialog} from "../../../actions/modal";
import {traitActivateRequest} from "../../../../shared/actions/trait";
import {getTraitDataModel} from "../../../../shared/models/game/evolution/TraitModel";

const styles = {
  content: {
    display: 'flex'
  }
  , animalWrapper: {}
  , recombinationSpace: {
    display: 'flex'
    , flex: '0 0 auto'
    , flexDirection: 'column'
    , justifyContent: 'space-around'
    , width: GameStyles.defaultWidth
  }
  , recombinationTraitContainer: {
    textAlign: 'center'
  }
};

export class QuestionRecombination extends React.PureComponent {
  state = {
    selectedTrait1: null
    , selectedTrait2: null
  };

  onSelectTrait1 = (trait) => (e) => this.setState({selectedTrait1: trait});

  onDeselectTrait1 = (e) => this.setState({selectedTrait1: null});

  onSelectTrait2 = (trait) => (e) => this.setState({selectedTrait2: trait});

  onDeselectTrait2 = (e) => this.setState({selectedTrait2: null});

  validate = () => {
    return !(!!this.state.selectedTrait1 && !!this.state.selectedTrait2);
  };

  confirmAction = () => {
    const {data, traitActivateRequest, closeDialog} = this.props;
    const {trait, sourceAnimal} = data;
    const {selectedTrait1, selectedTrait2} = this.state;
    if (!!selectedTrait1 && !!selectedTrait2) {
      traitActivateRequest(sourceAnimal.id, trait.id, selectedTrait1.id, selectedTrait2.id);
    }
    closeDialog();
  };

  render() {
    const {classes, game, data} = this.props;
    const {trait, sourceAnimal} = data;
    const animal1 = sourceAnimal;
    const animal2 = trait.findLinkedAnimal(game, animal1);
    const checkTrait1 = (targetTrait) => !getTraitDataModel(tt.TraitRecombination).getErrorOfUseOnTarget(game, animal1, targetTrait);
    const checkTrait2 = (targetTrait) => !getTraitDataModel(tt.TraitRecombination).getErrorOfUseOnTarget(game, animal2, targetTrait);
    return (
      <Fragment>
        <DialogTitle>{T.translate('Game.UI.TraitRecombinationDialog.Title')}</DialogTitle>
        <DialogContent className={classes.content}>
          <div className={classes.animalWrapper}>
            <RecombinationAnimal animal={animal1}
                                 selectedTrait={this.state.selectedTrait1}
                                 checkTrait={checkTrait1}
                                 onSelectTrait={this.onSelectTrait1}
            />
          </div>
          <div className={classes.recombinationSpace}>
            <div>
              {this.state.selectedTrait1
              && <RecombinationTrait classes={classes}
                                     right
                                     selectedTrait={this.state.selectedTrait1}
                                     onDeselectTrait={this.onDeselectTrait1}/>}
            </div>
            <div>
              {this.state.selectedTrait2
              && <RecombinationTrait classes={classes}
                                     left
                                     selectedTrait={this.state.selectedTrait2}
                                     onDeselectTrait={this.onDeselectTrait2}/>}
            </div>
          </div>
          <div className={classes.animalWrapper}>
            <RecombinationAnimal animal={animal2}
                                 selectedTrait={this.state.selectedTrait2}
                                 checkTrait={checkTrait2}
                                 onSelectTrait={this.onSelectTrait2}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant='contained'
                  color='primary'
                  disabled={this.validate()}
                  onClick={this.confirmAction}>
            {T.translate('Game.UI.TraitRecombinationDialog.Action')}
          </Button>
        </DialogActions>
      </Fragment>
    );
  }
}

const RecombinationAnimal = ({animal, selectedTrait, checkTrait, onSelectTrait}) => (
  <Animal animal={animal}>
    <AnimalTraitChooseList
      traitList={animal.traits.toList().filterNot(trait => selectedTrait && selectedTrait.id === trait.id)}
      checkTrait={checkTrait}
      onSelectTrait={onSelectTrait}
    />
  </Animal>
);

const RecombinationTrait = ({classes, selectedTrait, onDeselectTrait, right, left}) => (
  <div className={classes.recombinationTraitContainer}>
    {left && <IconArrowLeft/>}
    <AnimalTraitBase trait={selectedTrait}
                     canStart={true}
                     startInteraction={onDeselectTrait}/>
    {right && <IconArrowRight/>}
  </div>
);

export default compose(
  withStyles(styles)
  , connect(
    ({game, modal}) => ({game, data: modal.data})
    , {traitActivateRequest, closeDialog}
  )
)(QuestionRecombination);