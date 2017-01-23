import React, {Component} from 'react';
import RIP from 'react-immutable-proptypes';

import cn from 'classnames';

import {CardCollection} from './CardCollection.jsx';
import DragCard from './cards/Card.jsx';
import {DropAnimal} from './animals/Animal.jsx';
import Continent from './continent/Continent.jsx';
import {PortalTarget} from '../utils/PortalTarget.jsx'
import { AnimationServiceRef } from '../../services/AnimationService';

import {GameModelClient, PHASE} from '../../../shared/models/game/GameModel';
import {PlayerModel} from '../../../shared/models/game/PlayerModel';
import {CTT_PARAMETER} from '../../../shared/models/game/evolution/constants';

import {TraitMetamorphose} from '../../../shared/models/game/evolution/traitTypes';

export class PlayerWrapper extends Component {
  static contextTypes = {
    gameActions: React.PropTypes.object.isRequired
  };

  static propTypes = {
    game: React.PropTypes.instanceOf(GameModelClient).isRequired
    , player: React.PropTypes.instanceOf(PlayerModel).isRequired
    , upsideDown: React.PropTypes.bool.isRequired
    , connectRef: React.PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.$noop = () => null;
    this.$traitTakeFood = (animal) => context.gameActions.$traitTakeFood(animal.id);
    this.$traitActivate = (animal, trait, targetId) => {
      //const traitData = trait.getDataModel();
      //if (trait.type === TraitMetamorphose) {
      //
      //}
      this.context.gameActions.$traitActivate(animal.id, trait.id, targetId);
    };
    this.$deployTrait = (card, animal, alternateTrait, component) => {
      if (card.getTraitDataModel(alternateTrait).cardTargetType & CTT_PARAMETER.LINK) {
        component.setState({selectLink: {card, animal, alternateTrait}});
      } else {
        this.context.gameActions.$deployTrait(card.id, animal.id, alternateTrait);
      }
    };
    this.$deployLinkedTrait = (card, animal, alternateTrait, linkedAnimal) => {
      this.context.gameActions.$deployTrait(card.id, animal.id, alternateTrait, linkedAnimal.id);
    }
  }

  render() {
    const {game, player, upsideDown} = this.props;
    const isUser = game.userId === player.id;
    const innerElements = [
      this.renderContinent(game, player.continent, isUser)
      , this.renderCardCollection(game, player, isUser)
    ];
    return (
      <div className={cn({PlayerWrapper: true, UserWrapper: isUser, EnemyWrapper: !isUser})}
           data-player-id={player.id}>
        {upsideDown ? innerElements : innerElements.reverse()}
        <svg width="100%" height="100%" style={{position: 'absolute', left: '0', top: '0', zIndex: 100, pointerEvents: 'none'}}>
          <PortalTarget name={`svg-player-wrapper-${player.id}`} container='g'/>
        </svg>
      </div>
    );
  }

  renderCardCollection(game, player, isUser) {
    const dragEnabled = isUser
      && game.status.phase === PHASE.DEPLOY
      && game.isPlayerTurn();

    return (<CardCollection
      key='CardCollection'
      name={isUser ? 'Hand' : player.id}
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

  renderContinent(game, continent, isUser) {
    return (<Continent
      key='Continent'
      isUserContinent={isUser}>
      {continent.map(animal => this.renderAnimal(animal, isUser, game.isDeploy()))}
    </Continent>)
  }

  renderAnimal(animal, isUserContinent, isDeploy) {
    const onTraitDropped = !isDeploy ? this.$traitActivate : this.$noop;
    const onFoodDropped = !isDeploy ? this.$traitTakeFood : this.$noop;
    const onCardDropped = isDeploy ? this.$deployTrait : this.$noop;
    const onAnimalLink = isDeploy ? this.$deployLinkedTrait : this.$noop;
    return <DropAnimal
      ref={this.props.connectRef('Animal#' + animal.id)}
      key={animal.id}
      model={animal}
      isUserAnimal={isUserContinent}
      onTraitDropped={onTraitDropped}
      onFoodDropped={onFoodDropped}
      onCardDropped={onCardDropped}
      onAnimalLink={onAnimalLink}/>
  }
}

export default AnimationServiceRef(PlayerWrapper);