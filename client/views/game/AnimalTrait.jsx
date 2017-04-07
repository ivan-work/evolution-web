import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {GameProvider} from './GameProvider.jsx';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from './DND_ITEM_TYPE';

import { TraitModel } from '~/shared/models/game/evolution/TraitModel';

export class AnimalTraitRaw extends React.Component {
  static defaultProps = {
    disabled: false
  };

  static propTypes = {
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
    , owner: React.PropTypes.object
    , index: React.PropTypes.number.isRequired
    , disabled: React.PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {trait, index, disabled, connectDragSource, isDragging} = this.props;

    const className = classnames({
      AnimalTrait: true
      , disabled: disabled
      , enabled: !disabled
      , isDragging: isDragging
    });

    const body = <div className={className} style={{top: `-${(index + 1) * 1.6}em`}}>{trait.type.replace('Trait', '')}</div>;

    return connectDragSource ? connectDragSource(body) : body;
  }
}

export const DragAnimalTrait = DragSource(DND_ITEM_TYPE.TRAIT
  , {
    beginDrag: (props) => ({trait: props.trait, owner: props.owner})
    , canDrag: (props, monitor) => !props.disabled && props.trait.dataModel.checkAction(props.game, props.owner)
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
  })
)(AnimalTraitRaw);

export const AnimalTrait = GameProvider(DragAnimalTrait);