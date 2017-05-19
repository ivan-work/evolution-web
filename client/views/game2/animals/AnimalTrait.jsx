import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import classnames from 'classnames';

import {DragSource} from 'react-dnd';
import {DND_ITEM_TYPE} from './../dnd/DND_ITEM_TYPE';

import {PHASE} from '../../../../shared/models/game/GameModel';
import {AnimalModel} from '../../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

import AnimalTraitDetails from './AnimalTraitDetails.jsx';
import Tooltip from 'rc-tooltip';

import '../../game/animals/AnimalTrait.scss';

class AnimalTrait extends React.PureComponent {
  static propTypes = {
    trait: PropTypes.instanceOf(TraitModel).isRequired
  };

  static defaultProps = {classNames: {}};

  render() {
    const {trait, className} = this.props;

    const classNames = classnames(Object.assign(this.classNames || {}, {
      AnimalTrait: true
      , [trait.type]: true
      , value: trait.value
      , disabled: trait.disabled
    }));

    return (<div id={'AnimalTrait' + trait.id} className={classNames + (!!className ? ' ' + className : '')}>
      <Tooltip
        overlay={<AnimalTraitDetails trait={trait}/>}
        mouseEnterDelay={.5}
        destroyTooltipOnHide={true}
      >
        <div className='inner'>
          <div className='name'>{T.translate('Game.Trait.' + trait.type)}</div>
          <div className='food'>{trait.getDataModel().food > 0 ? ' +' + trait.getDataModel().food : null}</div>
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
      && game.status.phase === PHASE.FEEDING
      && sourceAnimal.ownerId === game.userId
      && trait.checkAction(game, sourceAnimal)
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
    trait: PropTypes.instanceOf(TraitModel).isRequired
    // by life
    , game: PropTypes.object.isRequired
    , sourceAnimal: PropTypes.instanceOf(AnimalModel).isRequired
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
    trait: PropTypes.instanceOf(TraitModel).isRequired
    // by life
    , game: PropTypes.object.isRequired
    , sourceAnimal: PropTypes.instanceOf(AnimalModel).isRequired
    , onClick: PropTypes.func.isRequired
  };

  render() {
    const {trait, game, sourceAnimal, onClick} = this.props;
    const active = (game.isPlayerTurn() || trait.getDataModel().transient)
      && game.status.phase === PHASE.FEEDING
      && sourceAnimal.ownerId === game.userId
      && trait.checkAction(game, sourceAnimal);
    this.classNames = {
      pointer: active
      , active
      , ClickAnimalTrait
      , value: trait.value
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