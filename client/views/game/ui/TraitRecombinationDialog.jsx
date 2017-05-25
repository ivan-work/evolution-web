import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react';

import {Dialog} from '../../utils/Dialog.jsx';
import {DialogTitle, DialogContent, Button} from 'react-mdl';

import {TraitRecombination} from '../../../../shared/models/game/evolution/traitsData';
import {Animal} from "../animals/Animal";
import {AnimalTrait} from "../animals/AnimalTrait";

const INITIAL_STATE = {traits: []};

export default class TraitRecombinationDialog extends React.Component {
  static propTypes = {
    game: PropTypes.object.isRequired
    , recombinationQuestion: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
    this.onChooseTrait = (traitId, position) => {
      const traits = this.state.traits;
      if (traits[position] === traitId) {
        traits[position] = null;
      } else {
        traits[position] = traitId;
      }
      this.setState({traits})
    };
    this.validate = () => {
      return !(!!this.state.traits[0] && !!this.state.traits[1]);
    }
  }

  componentWillReceiveProps(props) {
    const {onSelectTrait} = props.recombinationQuestion;
    this.confirmAction = () => {
      onSelectTrait(this.state.traits);
      this.setState(INITIAL_STATE);
    };
    this.onBackdropClick = () => {
      if (onSelectTrait) {
        onSelectTrait(null);
        this.setState(INITIAL_STATE);
      }
    };
  }

  render() {
    const {game, recombinationQuestion} = this.props;
    const {animal, trait} = recombinationQuestion;
    return (<Dialog show={!!animal} onBackdropClick={this.onBackdropClick}>
      <DialogTitle>{T.translate('Game.UI.TraitRecombinationDialog.Title')}</DialogTitle>
      {!!animal && this.renderDialogContent()}
    </Dialog>);
  }

  renderDialogContent() {
    const {game, recombinationQuestion} = this.props;
    const {animal, trait} = recombinationQuestion;

    const animal1 = animal;
    const animal2 = TraitRecombination.getLinkedAnimal(game, animal, trait);
    const traits1 = TraitRecombination.getTargets(game, animal1);
    const traits2 = TraitRecombination.getTargets(game, animal2);


    return (<DialogContent>
      <div className='TraitRecombinationDialog'>
        <div className='animals'>
          {this.renderAnimal(animal1, traits1, 0)}
          {this.renderAnimal(animal2, traits2, 1)}
        </div>
        <div className='actions'>
          <Button primary raised disabled={this.validate()} onClick={this.confirmAction}>
            {T.translate('Game.UI.TraitRecombinationDialog.Action')}
          </Button>
        </div>
      </div>
    </DialogContent>);
  }

  renderAnimal(animal, traits, position) {
    return <Animal model={animal}>
      {traits
        .reverse()
        .map(trait => (
          <div key={trait.id}
               onClick={() => this.onChooseTrait(trait.id, position)}
               className={'TraitHolder pointer' + (this.state.traits[position] === trait.id ? ' selected' + position : '')}>
            <AnimalTrait trait={trait} enableTooltip={false}/>
          </div>
        ))
      }
    </Animal>
  }
}