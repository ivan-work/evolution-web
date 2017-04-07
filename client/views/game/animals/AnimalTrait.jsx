import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {GameProvider} from './../providers/GameProvider.jsx';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from './../dnd/DND_ITEM_TYPE';

import { AnimalModel } from '../../../../shared/models/game/evolution/AnimalModel';
import { TraitModel } from '../../../../shared/models/game/evolution/TraitModel';
import { checkAction } from '../../../../shared/models/game/evolution/TraitDataModel';

import './AnimalTrait.scss';

class AnimalTrait extends Component {
  static defaultProps = {
    isPlayerTurn: false
  };

  static propTypes = {
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {trait, connectDragSource, isDragging, canDrag} = this.props;

    const className = classnames({
      AnimalTrait: true
      , canDrag
      , isDragging
      , draggable: connectDragSource
    });

    return <div className={className}>{T.translate('Game.Trait.' + trait.type)}</div>;
  }
}

class DragAnimalTrait_Body extends AnimalTrait {
  render() {
    return this.props.connectDragSource(super.render());
  }
}
DragAnimalTrait_Body.displayName = 'AnimalTrait';
DragAnimalTrait_Body.propTypes = {
  connectDragSource: PropTypes.func.isRequired
  , canDrag: PropTypes.bool.isRequired
  , isDragging: PropTypes.bool.isRequired
};

const DragAnimalTrait = DragSource(DND_ITEM_TYPE.TRAIT
  , {
    beginDrag: ({trait, sourceAnimal}) => ({trait, sourceAnimal})
    , canDrag: ({trait, sourceAnimal, game}, monitor) => (
      game.isPlayerTurn()
      && game.isFeeding()
      && sourceAnimal.ownerId === game.getPlayer().id
      && checkAction(game, trait.dataModel, sourceAnimal)
    )
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(DragAnimalTrait_Body);

DragAnimalTrait.propTypes = {
  // by GameProvider
  game: PropTypes.object.isRequired
  // by life
  , sourceAnimal: React.PropTypes.instanceOf(AnimalModel).isRequired
};

const GameDragAnimalTrait = GameProvider(DragAnimalTrait);

export {
  AnimalTrait
  , DragAnimalTrait as _DragAnimalTrait
  , GameDragAnimalTrait as DragAnimalTrait}