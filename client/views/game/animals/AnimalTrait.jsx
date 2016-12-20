import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {GameProvider} from './../providers/GameProvider.jsx';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from './../dnd/DND_ITEM_TYPE';

import { AnimalModel } from '../../../../shared/models/game/evolution/AnimalModel';
import { TraitModel } from '../../../../shared/models/game/evolution/TraitModel';

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
      , [trait.type]: true
      , value: trait.value
    });

    return <div className={className}>
      <div className='inner'>
        {T.translate('Game.Trait.' + trait.type)}
      </div>
    </div>;
  }
}

class DragAnimalTraitBody extends AnimalTrait {
  static displayName = 'AnimalTrait';
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired
    , canDrag: PropTypes.bool.isRequired
    , isDragging: PropTypes.bool.isRequired
  };
  render() {
    return this.props.connectDragSource(super.render());
  }
}

const DragAnimalTrait = DragSource(DND_ITEM_TYPE.TRAIT
  , {
    beginDrag: ({trait, sourceAnimal}) => ({trait, sourceAnimal})
    , canDrag: ({trait, sourceAnimal, game}, monitor) => (
      game.isPlayerTurn()
      && game.isFeeding()
      && sourceAnimal.ownerId === game.getPlayer().id
      && trait.getDataModel().checkAction(game, sourceAnimal)
    )
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(DragAnimalTraitBody);

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