import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes'
import T from 'i18n-react'

import * as MDL from 'react-mdl';

import PlayerWrapper from './PlayerWrapper.jsx';
import User from '../utils/User.jsx';
import PlayerSVG from './PlayerSVG.jsx'

const scrollSpeed = 6;

const SCALE_THRESHOLD = 20;

import styles from '../../styles.json';
const {PLAYER_STICKER_ARROW_SIZE} = styles;


export default class PlayerSticker extends React.Component {
  static getContainerById(id) {
    return document.getElementById(`PlayerStickerBody${id}`);
  }

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
    this.trackMouse = this.trackMouse.bind(this);
    this.trackWheel = this.trackWheel.bind(this);
    this.onCardCollectionIconClick = this.onCardCollectionIconClick.bind(this);
    const {game, player} = this.props;
    const isUser = game.userId === player.id;
    this.state = {
      showCards: isUser
      , scale: 1
      , minScale: .1
      , scrollX: 0
      , scrollY: 0
      , scrollWidth: 0
      , scrollHeight: 0
    };

    this.x = 0;
    this.y = 0;
  }

  onCardCollectionIconClick() {
    const {game, player} = this.props;
    const isUser = game.userId === player.id;
    if (isUser) {
      const showCards = !this.state.showCards;
      this.setState({showCards});
    }
  }

  switchZoom(e) {
    e.stopPropagation();
    if (this.state.scale !== this.state.minScale) {
      this.setScale(this.state.minScale);
    } else {
      this.setScale(1);
    }
  }

  scrollContainer() {
    const x = this.x;
    const y = this.y;
    if (this.div) {
      const bbx = this.div.getBoundingClientRect();

      this.calcScale();

      if (this.isInside) {
        let scrollX = this.state.scrollX;
        let scrollY = this.state.scrollY;

        const startX = bbx.left;
        const endX = bbx.right;
        const startY = bbx.top;
        const endY = bbx.bottom;

        if (startX <= x && x <= startX + PLAYER_STICKER_ARROW_SIZE)
          scrollX += scrollSpeed;
        if (endX - PLAYER_STICKER_ARROW_SIZE <= x && x <= endX)
          scrollX -= scrollSpeed;

        if (startY <= y && y <= startY + PLAYER_STICKER_ARROW_SIZE)
          scrollY += scrollSpeed;
        if (endY - PLAYER_STICKER_ARROW_SIZE <= y && y <= endY)
          scrollY -= scrollSpeed;

        this.setScroll(scrollX, scrollY);
      }
    }
    if (this.$isMounted) window.requestAnimationFrame(this.scrollContainer);
  }

  calcScale() {
    const outerW = this.div.offsetWidth;
    const outerH = this.div.offsetHeight;

    const innerWidth = this.inner.offsetWidth;
    const innerHeight = this.inner.offsetHeight;

    const scaleW = Math.min(1, (outerW / innerWidth));
    const scaleH = Math.min(1, (outerH / innerHeight));

    const minScale = Math.floor(Math.min(scaleW, scaleH) * SCALE_THRESHOLD) / SCALE_THRESHOLD;

    const scrollWidth = Math.floor(Math.max(0, innerWidth * this.state.scale - outerW) * SCALE_THRESHOLD) / SCALE_THRESHOLD;
    const scrollHeight = Math.floor(Math.max(0, innerHeight * this.state.scale - outerH) * SCALE_THRESHOLD) / SCALE_THRESHOLD;

    if (scrollWidth !== this.state.scrollWidth || scrollHeight !== this.state.scrollHeight) {
      this.setState({
        scrollWidth, scrollHeight
      })
    }
    if (minScale !== this.state.minScale) {
      // Initial autoscaling is turned off
      if (this.state.scale === this.state.minScale && this.state.scale !== 1) {
        this.setScale(minScale, minScale);
      } else {
        this.setScale(this.state.scale, minScale);
      }
    }
  }

  trackMouse(e) {
    const x = this.x = e.pageX;
    const y = this.y = e.pageY;
    if (this.div) {
      const bbx = this.div.getBoundingClientRect();
      this.isInside = x >= bbx.left && y >= bbx.top && x <= bbx.left + bbx.width && y <= bbx.bottom;
    }
  }

  trackWheel(e) {
    if (this.isInside) {
      if (e.deltaY < 0) {
        this.setScale(this.state.scale + .1);
      } else {
        this.setScale(this.state.scale - .1);
      }
    }
  }

  setScale(scale, minScale = this.state.minScale) {
    scale = Math.floor(Math.max(minScale, Math.min(scale, 1)) * SCALE_THRESHOLD) / SCALE_THRESHOLD;
    if (scale !== this.state.scale || minScale !== this.state.minScale) {
      this.setState({
        scale
        , minScale
      })
    }
  }

  setScroll(scrollX, scrollY) {
    scrollX = Math.floor(Math.max(-this.state.scrollWidth, Math.min(scrollX, this.state.scrollWidth)) * SCALE_THRESHOLD) / SCALE_THRESHOLD;
    scrollY = Math.floor(Math.max(0, Math.min(scrollY, this.state.scrollHeight)) * SCALE_THRESHOLD) / SCALE_THRESHOLD;
    if (scrollX !== this.state.scrollX || scrollY !== this.state.scrollY) {
      this.setState({
        scrollX, scrollY
      })
    }
  }

  componentDidMount() {
    this.$isMounted = true;
    document.addEventListener('mousemove', this.trackMouse, false);
    document.addEventListener('wheel', this.trackWheel, false);
    window.requestAnimationFrame(this.scrollContainer)
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.trackMouse);
    document.removeEventListener('wheel', this.trackWheel);
    this.$isMounted = false;
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.div && !prevState.showCards && this.state.showCards) {
  //     // this.div.scrollTop = this.div.scrollHeight;
  //   }
  // }

  render() {
    const {game, player} = this.props;
    const isUser = game.userId === player.id;
    return (<div className='PlayerStickerControls'>
      <div className='PlayerStickerBody'
           id={`PlayerStickerBody${player.id}`}
           ref={this.setupContainer}>
        <PlayerSVG ref={this.setupSvgContext}/>
        <div className='PlayerStickerInner'
             style={{
               transform: `translate(${this.state.scrollX}px, ${this.state.scrollY}px) scale(${this.state.scale})`
               , transformOrigin: '50% 100%'
             }}>
          <PlayerWrapper game={game} player={player} showCards={this.state.showCards} ref={this.setupInner}/>
        </div>

        {this.state.scrollX !== this.state.scrollWidth &&
        <MDL.Icon className='arrow arrow-left' name='keyboard_arrow_left'/>}
        {this.state.scrollX !== -this.state.scrollWidth &&
        <MDL.Icon className='arrow arrow-right' name='keyboard_arrow_right'/>}
        {this.state.scrollY !== this.state.scrollHeight &&
        <MDL.Icon className='arrow arrow-top' name='keyboard_arrow_up'/>}
        {this.state.scrollY !== 0 && <MDL.Icon className='arrow arrow-bottom' name='keyboard_arrow_down'/>}
      </div>
      <div className={'CardCollectionIcon' + (isUser ? ' pointer' : '') + (game.isPlayerTurn(player) ? ' active' : '')}
           onClick={this.onCardCollectionIconClick}>

        <User id={player.id}/>
        ({player.hand.size})
        {this.isInside ? 'isInside' : 'outSide'}
        {isUser && <MDL.Icon name={this.state.showCards ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}/>}
        <MDL.Icon name={this.state.scale === this.state.minScale ? 'zoom_in' : 'zoom_out'} onClick={this.switchZoom}/>
        {/*{this.state.scale}/{this.state.minScale} {this.state.scrollX}/{this.state.scrollWidth} {this.state.scrollY}/{this.state.scrollHeight}*/}
      </div>
    </div>);
  }
}
