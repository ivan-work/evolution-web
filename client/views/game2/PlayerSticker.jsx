import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'

import PlayerWrapper from "./PlayerWrapper.jsx";

const speedL = 2;
const speedR = 2.5; // You won't believe, but they're different. No idea why =(

export default class PlayerSticker extends React.Component {
  constructor(props) {
    super(props);
    this.setupContainer = this.setupContainer.bind(this);
    this.scrollContainer = this.scrollContainer.bind(this);
    this.trackScroll = this.trackScroll.bind(this);
    this.stopTrackScroll = this.stopTrackScroll.bind(this);
    this.x = 0;
  }

  setupContainer(div) {
    this.div = div;
  }

  scrollContainer() {
    const x = this.x;
    const y = this.y;
    if (this.div) {
      const bbx = this.div.getBoundingClientRect();
      console.log(y, bbx.top, bbx.bottom, y >= bbx.top && y <= bbx.bottom)
      if (x >= bbx.left && y >= bbx.top && x <= bbx.left + bbx.width && y <= bbx.bottom) {
        const start = this.div.offsetLeft;
        const step = this.div.offsetWidth / 3;
        const scroll = this.div.scrollLeft;
        if (start <= x && x <= start + step) {
          this.div.scrollLeft = scroll - speedL;
        } else if (1 * step + start <= x && x <= 2 * step + start) {
        } else if (2 * step + start <= x && x <= 3 * step + start) {
          this.div.scrollLeft = scroll + speedR;
        }
      }
      window.requestAnimationFrame(this.scrollContainer);
    }
  }

  trackScroll(e) {
    this.x = e.pageX;
    this.y = e.pageY;

  }

  stopTrackScroll(e) {
    // this.x = -1;
    // this.y = -1;
  }

  componentDidMount() {
    this.$isMounted = true;
    window.requestAnimationFrame(this.scrollContainer)
  }

  componentWillUnmount() {
    this.$isMounted = false;
  }

  render() {
    const {game} = this.props;
    return (<div className='PlayerSticker' onMouseMove={this.trackScroll} onMouseLeave={this.stopTrackScroll} ref={this.setupContainer}>
      <PlayerWrapper game={game} player={game.getPlayer()}/>
    </div>);
  }
}
