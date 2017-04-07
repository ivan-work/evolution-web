import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {BodyPortal} from './BodyPortal.jsx';
import shallowEqual from 'shallowequal';

const transitionTime = 200;

export class Dialog extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {
      isShowing: props.show
      , show: props.show
    }
  }

  componentDidMount() {
    this.$isMounted = true;
  }

  componentWillUnmount() {
    this.$isMounted = false;
  }

  componentWillReceiveProps(nextProps) {
    const {show: prevShow} = this.props;
    const {show: nextShow} = nextProps;
    if (prevShow && !nextShow) {
      this.setState({isShowing: false});
      setTimeout(() => {
        if (this.$isMounted) {
          this.setState({
            show: nextShow
          });
        }
      }, transitionTime);
    } else if (!prevShow && nextShow) {
      this.setState({
        show: nextShow
      });
      setTimeout(() => {
        if (this.$isMounted) {
          this.setState({
            isShowing: true
          });
        }
      }, 17);
    }
  }

  renderChild() {
    // Can't change root element, fails tests
    //const {show} = this.state;
    //if (!show) {
    //  console.log('rendering null')
    //  return null;
    //}
    //if (process.env.TEST) {
    //  console.log('rendering children')
    //  return <span>{this.props.children}</span>;
    //}
    //console.log('rendering BODY PORTAL')
    //return <BodyPortal className='DialogContainer'>
    //  <div className='Backdrop' style={{
    //    background: this.state.isShowing ? '' : 'none'
    //    , transition: `${transitionTime}ms all`
    //  }}>
    //    <div className='Dialog mdl-dialog' style={{
    //    marginTop: this.state.isShowing ? '' : '-10%'
    //    , transform: this.state.isShowing ? '' : 'translate(0,-125%)'
    //    , transition: `${transitionTime}ms all`
    //  }}>{this.props.children}</div>
    //  </div>
    //</BodyPortal>;
  }

  render() {
    const {show} = this.state;
    if (!show) {
      return null;
    }
    if (process.env.TEST) {
      return <span>{this.props.children}</span>;
    }
    return <BodyPortal className='DialogContainer'>
      <div className='Backdrop' style={{
        background: this.state.isShowing ? '' : 'none'
        , transition: `${transitionTime}ms all`
      }}>
        <div className='Dialog mdl-dialog' style={{
        marginTop: this.state.isShowing ? '' : '-10%'
        , transform: this.state.isShowing ? '' : 'translate(0,-125%)'
        , transition: `${transitionTime}ms all`
      }}>{this.props.children}</div>
      </div>
    </BodyPortal>;
  }
}

export const DialogActions = (props) => <div className='DialogActions'>{props.children}</div>