import React from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {DragSource} from 'react-dnd';
import {DND_ITEM_TYPE} from './../dnd/DND_ITEM_TYPE';

import {AnimalModel} from '../../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

import AnimalTraitDetails from './AnimalTraitDetails.jsx';
import Tooltip from 'rc-tooltip';

import './RoundAnimalTrait.scss';

const getTraitImage = require.context('../../../assets/gfx/traits');

class RoundAnimalTrait extends React.Component {
  static propTypes = {
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
  };

  static defaultProps = {classNames: {}};

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  getClassNames() {
    const {trait} = this.props;
    return {
      RoundAnimalTrait: true
      , [trait.type]: true
      , value: trait.value
    }
  }

  render() {
    const {trait} = this.props;

    const className = classnames(this.getClassNames());

    try {
      const img = getTraitImage(`./${trait.type}.svg`);

      if (img) {
        return (<div id={'AnimalTrait' + trait.id} className={className}>
          <Tooltip
            overlay={<AnimalTraitDetails trait={trait}/>}
            mouseEnterDelay={.5}
            destroyTooltipOnHide={true}
          >
            <div className='RoundAnimalTraitImage'>
              <img src={img}/>
              <div className='food'>{trait.getDataModel().food > 0 ? ' +' + trait.getDataModel().food : null}</div>
            </div>
          </Tooltip>
        </div>);
      }
    } catch (e) {
      // console.warn('Error loading:' + trait.type, e)
    }

    return (<div id={'AnimalTrait' + trait.id} className={className}>
      <Tooltip
        overlay={<AnimalTraitDetails trait={trait}/>}
        mouseEnterDelay={.5}
        destroyTooltipOnHide={true}
      >
        <div className='RoundAnimalTraitBody'>
          <div className='name'>{T.translate('Game.Trait.' + trait.type)}</div>
          <div className='food'>{trait.getDataModel().food > 0 ? ' +' + trait.getDataModel().food : null}</div>
        </div>
      </Tooltip>
    </div>);
  }
}

const DragRoundAnimalTrait = DragSource(DND_ITEM_TYPE.TRAIT
  , {
    beginDrag: ({trait, sourceAnimal}) => ({trait, sourceAnimal})
    , canDrag: ({trait, sourceAnimal, game}, monitor) => (
      game.isPlayerTurn()
      && game.isFeeding()
      && sourceAnimal.ownerId === game.userId
      && trait.checkAction(game, sourceAnimal)
    )
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(class extends RoundAnimalTrait {
  static displayName = 'AnimalTrait';

  static propTypes = {
    // by parent
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
    // by life
    , game: React.PropTypes.object.isRequired
    , sourceAnimal: React.PropTypes.instanceOf(AnimalModel).isRequired
    // by DnD
    , connectDragSource: React.PropTypes.func.isRequired
    , canDrag: React.PropTypes.bool.isRequired
    , isDragging: React.PropTypes.bool.isRequired
  };

  getClassNames() {
    const {canDrag, isDragging} = this.props;
    return Object.assign(super.getClassNames(), {
      draggable: true
      , active: canDrag
      , isDragging
    })
  }

  render() {
    const {connectDragSource} = this.props;
    return connectDragSource(super.render());
  }
});

class ClickRoundAnimalTrait extends RoundAnimalTrait {
  static propTypes = {
    // by parent
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
    // by life
    , game: React.PropTypes.object.isRequired
    , sourceAnimal: React.PropTypes.instanceOf(AnimalModel).isRequired
    , onClick: React.PropTypes.func.isRequired
  };

  isActive() {
    const {trait, game, sourceAnimal} = this.props;
    const active = (game.isPlayerTurn() || trait.getDataModel().transient)
      && game.isFeeding()
      && sourceAnimal.ownerId === game.userId
      && trait.checkAction(game, sourceAnimal);
  }

  getClassNames() {
    const trait = this.props.trait;
    const active = this.isActive();
    return Object.assign(super.getClassNames(), {
      pointer: active
      , active
      , ClickAnimalTrait: true
      , value: trait.value
    })
  }

  render() {
    const {onClick} = this.props;
    return (this.isActive()
      ? React.cloneElement(super.render(), {onClick})
      : super.render());
  };
}

export {
  RoundAnimalTrait
  , DragRoundAnimalTrait
  , ClickRoundAnimalTrait
}