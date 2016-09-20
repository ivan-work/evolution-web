import React from 'react';
import Immutable from 'immutable';
import {DropTargetPlayerContinentDropTargetZone} from './PlayerContinentDropTargetZone.jsx'

import {ANIMAL_SIZE} from './Animal.jsx'
export const ANIMAL_MARGIN = 10;

export class PlayerContinent extends React.Component {
  static propTypes = {
    onCardDropped: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.onOver = this.onOver.bind(this)
    this.state = {over: null}
  }

  onOver(index, isOver) {
    console.log('current: ', this.state.over);
    console.log('incoming: ', index, isOver);
    if (isOver) {
      console.log('change to index');
      this.setState({over: index});
    } else if (this.state.over === index) {
      console.log('nullify');
      this.setState({over: null});
    } else {
      console.log('ignore');
    }
  }

  renderDropTarget(index) {
    let width = 0;
    if (this.cardsCount == 0) {
      width = `100%`;
    } else if (index == 0 || index == this.cardsCount) {
      width = `calc(50% - ${(this.cardsCount - 1) * ((ANIMAL_SIZE.width + ANIMAL_MARGIN * 2) / 2)}px)`;
    } else {
      width = ANIMAL_SIZE.width + ANIMAL_MARGIN * 2 + 'px'
    }
    return <DropTargetPlayerContinentDropTargetZone
      key={index}
      width={width}
      index={index}
      onCardDropped={this.props.onCardDropped}
      onOver={this.onOver}/>
  }

  renderWrapper(child, key) {
    return <div className='animal-wrapper' style={{margin: ANIMAL_MARGIN, ...ANIMAL_SIZE}} key={key}>{child}</div>
  }

  render() {
    this.cardsCount = React.Children.count(this.props.children);
    return <div className="PlayerContinent">
      <div className="drop-targets-container">
      {new Array(1 + React.Children.count(this.props.children)).fill()
        .map((u,i) => this.renderDropTarget(i))}
      </div>
      <div className="animals-container-outer">
        <div className="animals-container-inner">
          {(this.cardsCount === 0 && this.state.over !== null
            ? this.renderWrapper(<div className="animal-placeholder"></div>, 'over')
            : null)}
          {React.Children.map(this.props.children, (child, index) => {
            return this.state.over === index
              // is over active
              ? [this.renderWrapper(<div className="animal-placeholder"></div>, 'over'), this.renderWrapper(child, child.id)]
              // is over notactive
              : this.renderWrapper(child, index);
            })}
          {(this.cardsCount !== 0 && this.cardsCount === this.state.over
            ? this.renderWrapper(<div className="animal-placeholder"></div>, 'over')
            : null)}
        </div>
      </div>
    </div>;
  }
}