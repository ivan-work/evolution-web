import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {DragSource} from 'react-dnd';
import {DND_ITEM_TYPE} from './../dnd/DND_ITEM_TYPE';

import {AnimalModel} from '../../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

import AnimalTraitDetails from './AnimalTraitDetails.jsx';
import {Tooltip} from '../../utils/Tooltips.jsx';
// import {Tooltip} from 'react-mdl';
// import {Tooltip2 as Tooltip} from '../../utils/Tooltips';
// import Tooltip from 'reactjs-mappletooltip';


import './AnimalTrait.scss';

class AnimalTrait extends Component {
  static propTypes = {
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
  };

  static defaultProps = {classNames: {}};

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {trait, connectDragSource, isDragging, canDrag} = this.props;

    const className = classnames(Object.assign(this.classNames || {}, {
      AnimalTrait: true
      , [trait.type]: true
      , value: trait.value
    }));

    return (<div id={'AnimalTrait' + trait.id} className={className}>
      <Tooltip label={<AnimalTraitDetails trait={trait}/>}>
        <div className='inner'>
          {T.translate('Game.Trait.' + trait.type)} {trait.getDataModel().food > 0 ? '+' + trait.getDataModel().food : null}
        </div>
      </Tooltip>
    </div>);
  }
}

const DragAnimalTrait = DragSource(DND_ITEM_TYPE.TRAIT
  , {
    beginDrag: ({trait, sourceAnimal}) => ({trait, sourceAnimal})
    , canDrag: ({trait, sourceAnimal, game}, monitor) => (
      game.isPlayerTurn()
      && game.isFeeding()
      && sourceAnimal.ownerId === game.userId
      && trait.getDataModel().checkAction(game, sourceAnimal)
    )
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(class extends AnimalTrait {
  static displayName = 'AnimalTrait';
  static propTypes = {
    // by parent
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
    // by life
    , game: PropTypes.object.isRequired
    , sourceAnimal: React.PropTypes.instanceOf(AnimalModel).isRequired
    // by DnD
    , connectDragSource: PropTypes.func.isRequired
    , canDrag: PropTypes.bool.isRequired
    , isDragging: PropTypes.bool.isRequired
  };

  render() {
    const {connectDragSource, canDrag, isDragging} = this.props;
    this.classNames = {
      draggable: true
      , active: canDrag
      , isDragging
    };
    return connectDragSource(super.render());
  }
});

class ClickAnimalTrait extends AnimalTrait {
  static propTypes = {
    // by parent
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
    // by life
    , game: PropTypes.object.isRequired
    , sourceAnimal: React.PropTypes.instanceOf(AnimalModel).isRequired
    , onClick: React.PropTypes.func.isRequired
  };

  render() {
    const {trait, game, sourceAnimal, onClick} = this.props;
    const active = game.isPlayerTurn()
      && game.isFeeding()
      && sourceAnimal.ownerId === game.userId
      && trait.getDataModel().checkAction(game, sourceAnimal);
    this.classNames = {
      pointer: active
      , active
    };
    return (active
      ? React.cloneElement(super.render(), {onClick})
      : super.render());
  };
}

export {
  AnimalTrait
  , DragAnimalTrait
  , ClickAnimalTrait
}