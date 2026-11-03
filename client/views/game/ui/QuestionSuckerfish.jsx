import React from 'react';
import T from "i18n-react";

import {branch, compose, renderNothing} from "recompose";
import {connect} from 'react-redux';
import withStyles from "@material-ui/core/styles/withStyles";

import Typography from "@material-ui/core/Typography";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import IconArrow from '@material-ui/icons/ArrowForward';

import User from "../../utils/User";
import Dialog from "../../../app/modals/Dialog";
import Timer from "../../utils/Timer";
import {Animal} from "../animals/Animal";
import AnimalTraitChooseList from "./AnimalTraitChooseList";
import {LocationIcon} from "../locations/LocationsStyles";

import {getMigration} from "../../../../shared/models/game/evolution/locations";
import {getSuckerfishCandidates} from "../../../../shared/actions/locations.checks";
import {traitSuckerfishRequest} from "../../../../shared/actions/game.locations";

const styles = {
  route: {
    display: 'flex'
    , alignItems: 'center'
    , justifyContent: 'center'
    , flexWrap: 'wrap'
    , margin: '4px 0 8px'
    , '& > *': {
      margin: '0 4px'
    }
  }
  , animals: {
    display: 'flex'
    , flexFlow: 'row wrap'
    , justifyContent: 'center'
  }
  , selected: {
    '& > div': {
      boxShadow: '0px 0px 4px 4px #1565C0'
    }
  }
};

const LocationName = ({location}) => (
  <Typography component='span' style={{display: 'inline-flex', alignItems: 'center'}}>
    <LocationIcon location={location} />&nbsp;{T.translate('Game.Location.' + location)}
  </Typography>
);

/**
 * TraitSuckerfish: owner decides which remoras follow the migrating animal
 */
export class QuestionSuckerfish extends React.PureComponent {
  state = {selected: {}};

  toggle = (animalId) => () => this.setState(({selected}) => ({
    selected: {...selected, [animalId]: !selected[animalId]}
  }));

  answer = (follow) => () => {
    const {candidates, traitSuckerfishRequest} = this.props;
    const animalIds = follow
      ? candidates.filter(animal => this.state.selected[animal.id]).map(animal => animal.id).toArray()
      : [];
    this.setState({selected: {}});
    traitSuckerfishRequest(animalIds);
  };

  render() {
    const {classes, game, migration, candidates} = this.props;
    const selectedCount = candidates.filter(animal => this.state.selected[animal.id]).size;
    return (
      <Dialog open={true}>
        <DialogTitle>{T.translate('Game.UI.SuckerfishDialog.Title')}</DialogTitle>
        <DialogContent>
          <Typography align='center'>
            {T.translate('Game.UI.SuckerfishDialog.Migrant')}&nbsp;
            <User id={migration.migrantPid} variant='simple' />
          </Typography>
          <div className={classes.route}>
            <LocationName location={migration.from} />
            <IconArrow />
            <LocationName location={migration.to} />
          </div>
          <Typography align='center'>
            {T.translate('Game.UI.SuckerfishDialog.Text')}
          </Typography>
          <Typography align='center'>
            {T.translate('Game.UI.TraitDefenceDialog.Time')}:&nbsp;
            <Timer start={migration.time} duration={game.settings.timeTraitResponse} />
          </Typography>
          <div className={classes.animals}>
            {candidates.map(animal => (
              <div key={animal.id} className={this.state.selected[animal.id] ? classes.selected : null}>
                <Animal animal={animal} canInteract={true} acceptInteraction={this.toggle(animal.id)}>
                  <AnimalTraitChooseList traitList={animal.traits.toList()} />
                </Animal>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant='outlined' onClick={this.answer(false)}>
            {T.translate('Game.UI.SuckerfishDialog.Stay')}
          </Button>
          <Button variant='contained' color='primary' disabled={selectedCount === 0} onClick={this.answer(true)}>
            {T.translate('Game.UI.SuckerfishDialog.Follow')} ({selectedCount})
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default compose(
  connect(({game}) => {
    const migration = getMigration(game);
    const isDecider = !!migration && !!game.userId && migration.getDecider() === game.userId;
    return {
      game
      , migration
      , candidates: isDecider ? getSuckerfishCandidates(game, game.userId, migration) : null
    };
  }, {traitSuckerfishRequest})
  , branch(({candidates}) => !candidates || candidates.size === 0, renderNothing)
  , withStyles(styles)
)(QuestionSuckerfish);
