import React, {Component} from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes';
import T from 'i18n-react';
import cn from 'classnames';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import * as MDL from 'react-mdl';
import {connect} from 'react-redux';
import {compose} from 'redux';

import {
  gameDeployTraitRequest
  , traitTakeFoodRequest
  , traitActivateRequest
  , traitTakeShellRequest
  , gameDeployRegeneratedAnimalRequest
} from '../../../shared/actions/actions';

import {CardCollection} from '../game/CardCollection.jsx';
import DragCard from '../game/cards/Card.jsx';
import {DropAnimal} from './animals/Animal.jsx';
import Continent from './continent/Continent.jsx';
import {AnimationServiceRef} from '../../services/AnimationService';

import {GameModelClient, PHASE} from '../../../shared/models/game/GameModel';
import {PlayerModel} from '../../../shared/models/game/PlayerModel';
import {CTT_PARAMETER} from '../../../shared/models/game/evolution/constants';

import * as tt from '../../../shared/models/game/evolution/traitTypes';

import TraitMetamorphoseDialog from './ui/TraitMetamorphoseDialog.jsx';
import TraitRecombinationDialog from './ui/TraitRecombinationDialog.jsx';

import './PlayerWrapper.scss';

const INITIAL_STATE = {
  metamorphoseQuestion: {}
  , recombinationQuestion: {}
};

export class PlayerWrapper extends Component {
  static propTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
    , player: PropTypes.instanceOf(PlayerModel).isRequired
    , connectRef: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    const {
      $deployTrait
      , $traitTakeFood
      , $traitActivate
      , $traitTakeShell
      , $deployRegeneratedAnimal
    } = props.gameActions;
    this.style = {};
    this.state = INITIAL_STATE;
    this.$noop = () => null;
    this.$traitTakeFood = (animal) => $traitTakeFood(animal.id);
    this.$traitActivate = (animal, trait, targetId) => {
      if (trait.type === tt.TraitMetamorphose) {
        this.setState({
          metamorphoseQuestion: {
            animal, trait
            , onSelectTrait: (targetTraitId) => {
              !!targetTraitId && $traitActivate(animal.id, trait.id, targetTraitId);
              this.setState(INITIAL_STATE)
            }
          }
        });
      } else if (trait.type === tt.TraitRecombination) {
        this.setState({
          recombinationQuestion: {
            animal, trait
            , onSelectTrait: (traits) => {
              if (!!traits && !!traits[0] && !!traits[1])
                $traitActivate(animal.id, trait.id, ...traits);
              this.setState(INITIAL_STATE)
            }
          }
        });
      } else {
        $traitActivate(animal.id, trait.id, targetId);
      }
    };

    this.$deployTrait = (card, animal, alternateTrait, component) => {
      if (card.getTraitDataModel(alternateTrait).cardTargetType & CTT_PARAMETER.LINK) {
        component.setState({selectLink: {card, animal, alternateTrait}});
      } else {
        $deployTrait(card.id, animal.id, alternateTrait);
      }
    };

    this.$deployLinkedTrait = (card, animal, alternateTrait, linkedAnimal) =>
      $deployTrait(card.id, animal.id, alternateTrait, linkedAnimal.id);

    this.$traitTakeShell = (animal, trait) => $traitTakeShell(animal.id, trait.id);

    this.$deployRegeneratedAnimal = (card, animal) => $deployRegeneratedAnimal(card.id, animal.id)
  }

  render() {
    const {game, player, showCards} = this.props;
    const isUser = game.userId === player.id;
    return (
      <div className={cn({PlayerWrapper: true, UserWrapper: isUser, EnemyWrapper: !isUser})}
           id={`PlayerWrapper${player.id}`}
           data-player-id={player.id}>
        <div className='flex'/>
        <TraitMetamorphoseDialog game={game} metamorphoseQuestion={this.state.metamorphoseQuestion}/>
        <TraitRecombinationDialog game={game} recombinationQuestion={this.state.recombinationQuestion}/>
        {this.renderContinent(game, player, isUser)}
        {this.renderCardCollection(game, player, isUser)}
      </div>
    );
  }

  renderCardCollection(game, player, isUser) {
    const {showCards} = this.props;
    const dragEnabled = isUser
      && (game.status.phase === PHASE.DEPLOY && game.isPlayerTurn())
      || (game.status.phase === PHASE.REGENERATION);

    return (<CardCollection
      key='CardCollection'
      name={isUser ? 'Hand' : player.id}
      visible={showCards && player.hand.size > 0}
      isUser={isUser}>
      {player.hand.map((cardModel, i) => this.renderCard(cardModel, dragEnabled, isUser))}
    </CardCollection>)
  }

  renderCard(cardModel, dragEnabled, isUser) {
    return (<DragCard
      key={cardModel.id}
      ref={this.props.connectRef('Card#' + cardModel.id)}
      card={cardModel}
      isUser={isUser}
      dragEnabled={dragEnabled}/>);
  }

  renderContinent(game, player, isUser) {
    return (
      <Continent
        key='Continent'
        isActive={game.isPlayerTurn(player)}
        isUserContinent={isUser}>
        {player.continent.map(animal => this.renderAnimal(animal, isUser))}
      </Continent>
    );
  }

  renderAnimal(animal, isUserContinent) {
    const {game} = this.props;
    const isDeploy = game.status.phase === PHASE.DEPLOY;
    const isFeeding = game.status.phase === PHASE.FEEDING;
    const isRegeneration = game.status.phase === PHASE.REGENERATION;
    const onTraitDropped = isFeeding ? this.$traitActivate : this.$noop;
    const onTraitShellDropped = isFeeding ? this.$traitTakeShell : this.$noop;
    const onFoodDropped = isFeeding ? this.$traitTakeFood : this.$noop;
    const onCardDropped = isDeploy ? this.$deployTrait :
      isRegeneration ? this.$deployRegeneratedAnimal
        : this.$noop;
    const onAnimalLink = isDeploy ? this.$deployLinkedTrait : this.$noop;
    return (
      <DropAnimal
        ref={this.props.connectRef('Animal#' + animal.id)}
        key={animal.id}
        game={game}
        model={animal}
        isUserAnimal={isUserContinent}
        onTraitDropped={onTraitDropped}
        onTraitShellDropped={onTraitShellDropped}
        onFoodDropped={onFoodDropped}
        onCardDropped={onCardDropped}
        onAnimalLink={onAnimalLink}/>
    );
  }
}

export const PlayerWrapperView = compose(
  connect((state) => ({})
    , (dispatch) => ({
      gameActions: {
        // PHASE.DEPLOY
        $deployTrait: (...args) => dispatch(gameDeployTraitRequest(...args))
        // PHASE.FEEDING
        , $traitTakeFood: (...args) => dispatch(traitTakeFoodRequest(...args))
        , $traitActivate: (...args) => dispatch(traitActivateRequest(...args))
        , $traitTakeShell: (...args) => dispatch(traitTakeShellRequest(...args))
        // PHASE.REGENERATION
        , $deployRegeneratedAnimal: (...args) => dispatch(gameDeployRegeneratedAnimalRequest(...args))
      }
    }))
  , AnimationServiceRef
)(PlayerWrapper);

export default PlayerWrapperView;