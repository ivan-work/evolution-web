import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {BodyPortal} from './BodyPortal.jsx';
import shallowEqual from 'shallowequal';

const transitionTime = 500;

export class Dialog extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {
      isShowing: props.show
      , show: props.show
    }
  }

  componentWillReceiveProps(nextProps) {
    const {show: prevShow} = this.props;
    const {show: nextShow} = nextProps;
    if (prevShow && !nextShow) {
      this.setState({isShowing: false});
      setTimeout(() => {
        this.setState({
          show: nextShow
        });
      }, transitionTime);
    } else if (!prevShow && nextShow) {
      this.setState({
        show: nextShow
      });
      setTimeout(() => {
        this.setState({
          isShowing: true
        });
      }, 17);
    }
  }

  render() {
    const {show} = this.state;
    if (!show) {
      return null;
    }
    return <BodyPortal className='DialogContainer'>
      <div className='Backdrop' style={{
        background: this.state.isShowing ? '' : 'none'
        , transition: `${transitionTime}ms all`
      }}>
        <div className='Dialog mdl-dialog' ref={() => this.rendered()} style={{
        marginTop: this.state.isShowing ? '' : '-10%'
        , transform: this.state.isShowing ? '' : 'translate(0,-125%)'
        , transition: `${transitionTime}ms all`
      }}>{this.props.children}</div>
      </div>
    </BodyPortal>;
  }

  rendered() {
    //if (this.props.show && !this.state.isShowing) {
    //  this.setState({
    //    isShowing: true
    //  });
    //}
  }
}

export const DialogActions = (props) => <div className='DialogActions'>{props.children}</div>