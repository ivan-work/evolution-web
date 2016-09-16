import React from 'react';
import Immutable from 'immutable';
import {DropTargetPlayerContinentDropTargetZone} from './PlayerContinentDropTargetZone.jsx'

import {CARD_SIZE} from './Card.jsx'
export const CARD_MARGIN = 10;

export class PlayerContinent extends React.Component {
  static propTypes = {
    onCardDropped: React.PropTypes.func
  };

  renderDropTarget(index) {
    let width = 0;
    if (this.cardsCount == 0) {
      width = `100%`;
    } else if (index == 0 || index == this.cardsCount) {
      width = `calc(50% - ${(this.cardsCount - 1) * ((CARD_SIZE.width + CARD_MARGIN * 2) / 2)}px)`;
    } else {
      width = CARD_SIZE.width + CARD_MARGIN * 2 + 'px'
    }
    return <DropTargetPlayerContinentDropTargetZone key={index} width={width} position={index} onCardDropped={this.props.onCardDropped}/>
  }

  render() {
    this.cardsCount = React.Children.count(this.props.children);
    return <div className="PlayerContinent">
      {new Array(1 + React.Children.count(this.props.children)).fill()
        .map((u,i) => this.renderDropTarget(i))}
      <div className="cards-container-outer">
        <div className="cards-container-inner">
          {React.Children.map(this.props.children, (child, i) => {
            return <div className='card-wrapper' style={{margin: CARD_MARGIN, ...CARD_SIZE}} key={i}>{child}</div>
            })}
        </div>
      </div>
    </div>;
  }
}