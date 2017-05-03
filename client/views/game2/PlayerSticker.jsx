import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'

import * as MDL from 'react-mdl';

import PlayerWrapper from './PlayerWrapper.jsx';
import User from '../utils/User.jsx';
import PlayerSVG from './PlayerSVG.jsx'

const speedL = 6;
const speedR = 6.5; // You won't believe, but they're different. No idea why =(
const speed = 5;

export default class PlayerSticker extends React.Component {

  static childContextTypes = {svgContext: PropTypes.object.isRequired};

  getChildContext() {
    return {svgContext: this.promiseSVGContext};
  }

  constructor(props) {
    super(props);
    this.promiseSVGContext = new Promise((resolve, reject) => {
      this.setupSvgContext = (c) => resolve(c);
    });
    this.setupContainer = (c) => this.div = c;
    this.setupInner = (c) => this.inner = ReactDOM.findDOMNode(c);
    this.switchZoom = this.switchZoom.bind(this);
    this.scrollContainer = this.scrollContainer.bind(this);
    this.trackScroll = this.trackScroll.bind(this);
    this.onCardCollectionIconClick = this.onCardCollectionIconClick.bind(this);
    const {game, player} = this.props;
    const isUser = game.userId === player.id;
    this.state = {
      showCards: isUser
      , zoom: true
    };

    this.x = 0;
    this.y = 0;
    this.zoom = 0;
    this.waitingCounter = 0;
  }

  onCardCollectionIconClick() {
    const {game, player} = this.props;
    const isUser = game.userId === player.id;
    if (isUser) {
      const showCards = !this.state.showCards;
      this.setState({showCards});
    }
  }

  switchZoom() {
    this.setState({zoom: !this.state.zoom});
  }

  scrollContainer() {
    const x = this.x;
    const y = this.y;
    if (this.div) {
      const bbx = this.div.getBoundingClientRect();
      // console.log(x, bbx.top, bbx.bottom, y >= bbx.top && y <= bbx.bottom)
      const isInside = x >= bbx.left && y >= bbx.top && x <= bbx.left + bbx.width && y <= bbx.bottom;
      if (this.state.zoom) {
        this.calcScale();
      } else if (isInside) {
        this.inner.style.transform = `scale(1)`;
        this.waitingCounter = 0;
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
        const stepY = bbx.height / 5;
        const scrollY = this.div.scrollTop;
        if (startY <= y && y <= startY + stepY) {
          this.div.scrollTop = scrollY - speed;
        } else if (1 * stepY + startY <= y && y <= 4 * stepY + startY) {
        } else if (4 * stepY + startY <= y && y <= 5 * stepY + startY) {
          this.div.scrollTop = scrollY + speed;
        }
      } else {
        if (this.waitingCounter > 100) {
          this.div.scrollTop += speed;
        } else {
          this.waitingCounter++;
        }
      }
    }
    if (this.$isMounted) window.requestAnimationFrame(this.scrollContainer);
  }

  calcScale() {
    const outerW = this.div.offsetWidth;
    const outerH = this.div.offsetHeight;
    const innerW = this.inner.scrollWidth;
    const innerH = this.inner.scrollHeight + 20;
    const scaleW = Math.min(1, Math.ceil((outerW / innerW) * 100) / 100);
    const scaleH = Math.min(1, Math.ceil((outerH / innerH) * 100) / 100);
    const scale = Math.min(scaleW, scaleH);
    this.inner.style.transform = `scale(${scale})`;
    this.div.scrollTop += this.div.scrollHeight;
  }

  trackScroll(e) {
    this.x = e.pageX;
    this.y = e.pageY;
  }

  componentDidMount() {
    this.$isMounted = true;
    document.addEventListener('mousemove', this.trackScroll, false);
    window.requestAnimationFrame(this.scrollContainer)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.trackScroll);
    this.$isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.div && !prevState.showCards && this.state.showCards) {
      this.div.scrollTop = this.div.scrollHeight;
    }
  }

  render() {
    const {game, player} = this.props;
    const isUser = game.userId === player.id;
    return (<div className='PlayerStickerControls'>
      <div style={{position: 'absolute', top: '.5em', left: '.5em', zIndex: 100}}>
        <MDL.IconButton name={this.state.zoom ? 'zoom_out' : 'zoom_in'} onClick={this.switchZoom}/>
        <User id={player.id}/>
      </div>
      <div className='PlayerSticker'
           id={`PlayerSticker${player.id}`}
           ref={this.setupContainer}>
        <PlayerSVG ref={this.setupSvgContext}/>
        <PlayerWrapper game={game} player={player} showCards={this.state.showCards} ref={this.setupInner}/>
      </div>
      <div className={'CardCollectionIcon' + (isUser ? ' pointer' : '')}
           onClick={this.onCardCollectionIconClick}>
        {isUser && <MDL.Icon name={this.state.showCards ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}/>}
        ({player.hand.size})
      </div>
    </div>);
  }
}
