import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'

import * as MDL from 'react-mdl';

import PlayerWrapper from "./PlayerWrapper.jsx";

const speedL = 6;
const speedR = 6.5; // You won't believe, but they're different. No idea why =(
const speed = 2;

export default class PlayerSticker extends React.Component {
  constructor(props) {
    super(props);
    this.setupContainer = this.setupContainer.bind(this);
    this.scrollContainer = this.scrollContainer.bind(this);
    this.trackScroll = this.trackScroll.bind(this);
    this.stopTrackScroll = this.stopTrackScroll.bind(this);
    this.onCardCollectionIconClick = this.onCardCollectionIconClick.bind(this);
    this.x = 0;
    this.state = {
      showCards: false
    }
  }

  onCardCollectionIconClick() {
    const {game, player} = this.props;
    const isUser = game.userId === player.id;
    if (isUser) {
      this.setState({showCards: !this.state.showCards})
    }
  }

  setupContainer(div) {
    this.div = div;
  }

  scrollContainer() {
    const x = this.x;
    const y = this.y;
    if (this.div) {
      const bbx = this.div.getBoundingClientRect();
      // console.log(x, bbx.top, bbx.bottom, y >= bbx.top && y <= bbx.bottom)
      if (x >= bbx.left && y >= bbx.top && x <= bbx.left + bbx.width && y <= bbx.bottom) {
        const startX = bbx.left;
        const stepX = bbx.width / 5;
        const scrollX = this.div.scrollLeft;
        if (startX <= x && x <= startX + stepX) {
          this.div.scrollLeft = scrollX - speedL;
        } else if (1 * stepX + startX <= x && x <= 4 * stepX + startX) {
        } else if (4 * stepX + startX <= x && x <= 5 * stepX + startX) {
          this.div.scrollLeft = scrollX + speedR;
        }
        const startY = bbx.top;
        const stepY = bbx.height / 3;
        const scrollY = this.div.scrollTop;
        if (startY <= y && y <= startY + stepY) {
          this.div.scrollTop = scrollY - speed;
        } else if (1 * stepY + startY <= y && y <= 2 * stepY + startY) {
          this.div.scrollTop = scrollY + speed;
        } else if (2 * stepY + startY <= y && y <= 3 * stepY + startY) {
          this.div.scrollTop = scrollY + speed;
        }
      } else {
        this.div.scrollTop += speed;
      }
      window.requestAnimationFrame(this.scrollContainer);
    }
  }

  trackScroll(e) {
    this.x = e.pageX;
    this.y = e.pageY;
  }

  stopTrackScroll(e) {
    this.x = -1;
    this.y = -1;
  }

  componentDidMount() {
    this.$isMounted = true;
    window.requestAnimationFrame(this.scrollContainer)
  }

  componentWillUnmount() {
    this.$isMounted = false;
  }

  render() {
    const {game, player} = this.props;
    const isUser = game.userId === player.id;
    return (<div className='PlayerStickerControls'>
      <div className='PlayerSticker'
           id={`PlayerSticker${player.id}`}
           onMouseMove={this.trackScroll}
           onMouseLeave={this.stopTrackScroll}
           ref={this.setupContainer}>
        <PlayerWrapper game={game} player={player} showCards={this.state.showCards}/>
      </div>
      <div className={'CardCollectionIcon' + (isUser ? ' pointer' : '')}
           onClick={this.onCardCollectionIconClick}>
        {isUser && <MDL.Icon name={this.state.showCards ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}/>}
        ({player.hand.size})
      </div>
    </div>);
  }
}
