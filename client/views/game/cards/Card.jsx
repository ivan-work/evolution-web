import React from 'react';
import T from 'i18n-react';
import classnames from 'classnames';

import { DragSource } from 'react-dnd';
import { DND_ITEM_TYPE } from './../dnd/DND_ITEM_TYPE';

import { CardModel } from '../../../../shared/models/game/CardModel';
import './Card.scss';

export class Card extends React.Component {
  static propTypes = {
    card: React.PropTypes.instanceOf(CardModel).isRequired
    , alternateTrait: React.PropTypes.bool
  };

  constructor(props, context) {
    super(props, context);
    this.state = {alternateTrait: this.props.alternateTrait};
    this.onCardClick = this.onCardClick.bind(this);
  }

  getClassNames() {
    return {
      Card: true
      , ['trait-count-' + this.props.card.traitsCount]: true
      , alternateTrait: this.state.alternateTrait
    }
  }

  onCardClick(e) {
  }

  render() {
    const {card} = this.props;

    const classNames = classnames(this.getClassNames());

    return <div className={classNames} onClick={this.onCardClick}>
      <div className='inner' style={{backgroundImage: `url('${card.image}')`}}>
        {card.traitsCount === 1
          ? (<div className={'trait trait-single ' + card.trait1}>{T.translate('Game.Trait.' + card.trait1)}</div>)
          : null}
        {card.traitsCount === 2
          ? (<div className={'trait trait1 ' + card.trait1}>{T.translate('Game.Trait.' + card.trait1)}</div>)
          : null}
        {card.traitsCount === 2
          ? (<div className={'trait trait2 ' + card.trait2}>{T.translate('Game.Trait.' + card.trait2)}</div>)
          : null}
      </div>
    </div>
  }
}

export const DragCard = DragSource(DND_ITEM_TYPE.CARD
  , {
    beginDrag: (props, monitor, component) => ({card: props.card, alternateTrait: component.state.alternateTrait})
    , canDrag: (props, monitor) => props.dragEnabled
    , endDrag: (props, monitor, component) => {
      if (component !== null) {
        component.cooldown = true;
        setTimeout(() => {
          component.cooldown = false;
        }, 200);
      }
    }
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(class extends Card {
  static propTypes = {
    ...Card.propTypes
    , dragEnabled: React.PropTypes.bool
  };

  onCardClick() {
    const {card, canDrag} = this.props;
    if (card.traitsCount === 2 && canDrag) {
      if (this.cooldown) {
        console.warn('switchTrait cooldown active', this.props.card.id);
        return;
      }
      this.setState({alternateTrait: !this.state.alternateTrait});
    }
  }

  getClassNames() {
    const {canDrag, isDragging} = this.props;
    return {
      ...super.getClassNames()
      , draggable: true
      , canDrag
      , isDragging
    }
  }

  render() {
    return this.props.connectDragSource(super.render())
  }
});

export default DragCard;