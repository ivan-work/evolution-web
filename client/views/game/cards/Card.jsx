import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import classnames from 'classnames';

import {DragSource} from 'react-dnd';
import {DND_ITEM_TYPE} from './../dnd/DND_ITEM_TYPE';

import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';
import {CardModel} from '../../../../shared/models/game/CardModel';
import './Card.scss';

import Tooltip from '../../utils/Tooltip.jsx';
import AnimalTraitDetails from '../animals/AnimalTraitDetails.jsx';

export class Card extends React.Component {
  static propTypes = {
    card: PropTypes.instanceOf(CardModel).isRequired
    , alternateTrait: PropTypes.bool
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
      , cover: this.props.card.traitsCount === 0
    }
  }

  onCardClick(e) {
  }

  render() {
    const {card} = this.props;

    const classNames = classnames(this.getClassNames());

    const tooltipProps = {
      placement: 'top'
      , mouseLeaveDelay: 0
    };

    return <div id={'Card' + card.id} className={classNames} onClick={this.onCardClick}>
      <div className='cover-inner'>&nbsp;</div>
      <div className='inner'>
        {card.traitsCount === 1
          ? (<Tooltip {...tooltipProps} overlay={<AnimalTraitDetails trait={TraitModel.new(card.trait1)}/>}>
            <div className={'trait trait-single ' + card.trait1}>{T.translate('Game.Trait.' + card.trait1)}</div>
          </Tooltip>)
          : null}
        {card.traitsCount === 2
        && (<Tooltip {...tooltipProps} overlay={<AnimalTraitDetails trait={TraitModel.new(card.trait1)}/>}>
          <div className={'trait trait1 ' + card.trait1}>{T.translate('Game.Trait.' + card.trait1)}</div>
        </Tooltip>)}
        {card.traitsCount === 2
        && (<Tooltip {...tooltipProps} overlay={<AnimalTraitDetails trait={TraitModel.new(card.trait2)}/>}>
          <div className={'trait trait2 ' + card.trait2}>{T.translate('Game.Trait.' + card.trait2)}</div>
        </Tooltip>)}
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
)(class Card extends Card {
  static propTypes = {
    ...Card.propTypes
    , dragEnabled: PropTypes.bool
    , isUser: PropTypes.bool
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
    const {canDrag, isDragging, isUser} = this.props;
    return {
      ...super.getClassNames()
      , isUser
      , draggable: true
      , active: canDrag
      , disabled: !canDrag
      , isDragging
    }
  }

  render() {
    return this.props.connectDragSource(super.render())
  }
});

export default DragCard;