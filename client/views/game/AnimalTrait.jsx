import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {GameProvider} from './providers/GameProvider.jsx';

import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { DND_ITEM_TYPE } from './dnd/DND_ITEM_TYPE';

import { TraitModel } from '~/shared/models/game/evolution/TraitModel';

export const ANIMAL_TRAIT_SIZE = {
  width: 60
  , height: 20
};

class _AnimalTrait extends React.Component {
  static defaultProps = {
    isUserTurn: false
  };

  static propTypes = {
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
    , owner: React.PropTypes.object.isRequired
    , index: React.PropTypes.number.isRequired
    // by DragSource
    , connectDragSource: React.PropTypes.func
    , connectDragPreview: React.PropTypes.func
    , isDragging: React.PropTypes.bool
    , canDrag: React.PropTypes.bool
    // by GameProvider
    , game: React.PropTypes.object.isRequired
    , isUserTurn: React.PropTypes.bool.isRequired
    , currentUserId: React.PropTypes.string.isRequired
    , isDeploy: React.PropTypes.bool.isRequired
    , isFeeding: React.PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  componentDidMount() {
    if (this.props.connectDragPreview && !process.env.TEST) {
      this.props.connectDragPreview(getEmptyImage());
    }
  }

  render() {
    const {trait, index, connectDragSource, isDragging, canDrag} = this.props;

    const className = classnames({
      AnimalTrait: true
      , disabled: !canDrag
      , enabled: canDrag
      , isDragging: isDragging
    });

    const body = <div className={className} style={{
      top: `-${(index + 1) * ANIMAL_TRAIT_SIZE.height}px`
      , width: ANIMAL_TRAIT_SIZE.width + 'px'
      , height: ANIMAL_TRAIT_SIZE.height + 'px'
    }}>{trait.type.replace('Trait', '')}</div>;

    return connectDragSource ? connectDragSource(body) : body;
  }
}

const _DraggableAnimalTrait = DragSource(DND_ITEM_TYPE.TRAIT
  , {
    beginDrag: (props) => ({trait: props.trait, owner: props.owner})
    , canDrag: (props, monitor) => props.isUserTurn
      && props.owner.ownerId === props.currentUserId
      && props.isFeeding
      && props.trait.dataModel.checkAction(props.game, props.owner)
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , connectDragPreview: connect.dragPreview()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(_AnimalTrait);

export const DraggableAnimalTrait = GameProvider(_DraggableAnimalTrait);
export const AnimalTrait = GameProvider(_AnimalTrait);