import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import './Food.scss';

import {GameProvider} from './providers/GameProvider.jsx';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from './dnd/DND_ITEM_TYPE';

import {TRAIT_COOLDOWN_LINK} from '../../../shared/models/game/evolution/constants';

//const graphics = ['\u1F345']/*, '&#127814;', '&#127815;'
//  , '&#127816;', '&#127817;', '&#127818;', '&#127819;', '&#127820;'
//  , '&#127821;', '&#127822;', '&#127823;', '&#127824;', '&#127825;', '&#127826;', '&#127827;'];*/
//const getGraphics = () => graphics[Math.floor(Math.random() * graphics.length)];

export class Food extends React.Component {
  static propTypes = {
    // by DragFood
    connectDragSource: React.PropTypes.func
    , canDrag: React.PropTypes.bool
    , isDragging: React.PropTypes.bool
    // by GameProvider
    , game: React.PropTypes.object
    , isPlayerTurn: React.PropTypes.bool
    , currentUserId: React.PropTypes.string
    , isDeploy: React.PropTypes.bool
    , isFeeding: React.PropTypes.bool
  };

  constructor(props) {
    super(props);
    //this.graphics = getGraphics();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {canDrag, connectDragSource, isDragging} = this.props;

    const className = classnames({
      Food: true
      , 'material-icons': true
      , draggable: connectDragSource
      , canDrag
      , isDragging
    });

    const body = <div className={className}>spa</div>;

    return connectDragSource ? connectDragSource(body) : body;
  }
}

export const DragFood = GameProvider(DragSource(DND_ITEM_TYPE.FOOD
  , {
    beginDrag: (props) => ({index: props.index})
    , canDrag: (props, monitor) => !props.disabled
      && props.isPlayerTurn
      && !props.game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, props.currentUserId, null)
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(Food));