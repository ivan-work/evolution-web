import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import classnames from 'classnames';

import {DragSource} from 'react-dnd';
import {DND_ITEM_TYPE} from './../dnd/DND_ITEM_TYPE';

import {PHASE} from '../../../../shared/models/game/GameModel';
import {AnimalModel} from '../../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';
import * as tt from '../../../../shared/models/game/evolution/traitTypes';

import AnimalTraitDetails from './AnimalTraitDetails.jsx';
import Tooltip from '../../utils/Tooltip.jsx';

import '../animals/AnimalTrait.scss';

class AnimalTrait extends React.PureComponent {
  static propTypes = {
    trait: PropTypes.instanceOf(TraitModel).isRequired
    , enableTooltip: PropTypes.bool
  };

  static defaultProps = {
    classNames: {}
    , enableTooltip: true
  };

  render() {
    const {trait, className, enableTooltip} = this.props;

    const classNames = classnames(Object.assign({
      AnimalTrait: true
      , [trait.type]: true
      , value: trait.value
      , disabled: trait.disabled
    }, this.classNames || {}));

    return (<div id={'AnimalTrait' + trait.id} className={classNames + (!!className ? ' ' + className : '')}>
      <Tooltip
        overlay={enableTooltip && <AnimalTraitDetails trait={trait}/>}
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
    const traitCarnivorous = sourceAnimal.hasTrait(tt.TraitCarnivorous);
    const active = (
      (sourceAnimal.ownerId === game.userId)
      && (( // Normal trait
        (game.isPlayerTurn() || trait.getDataModel().transient)
        && game.status.phase === PHASE.FEEDING
        && trait.checkAction(game, sourceAnimal)
      ) || ( // Ambush
        trait.type === tt.TraitAmbush
        && game.status.phase === PHASE.AMBUSH
        && traitCarnivorous
        && !traitCarnivorous.checkActionFails(game, sourceAnimal)
      ))
    );
    const value = (trait.value
      || (
        game.status.phase === PHASE.AMBUSH
        && !!game.getIn(['ambush', 'ambushers', sourceAnimal.id])
      )
    );
    this.classNames = {
      pointer: active
      , active
      , ClickAnimalTrait
      , value
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