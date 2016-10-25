import React, {Component, PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {BodyPortal} from './BodyPortal.jsx';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import './Dialog.scss';

export class Dialog extends Component {
  static propTypes = {
    show: PropTypes.bool
    , onBackdropClick: PropTypes.func
  };

  static defaultProps = {
    show: false
    , onBackdropClick: () => null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {show, onBackdropClick} = this.props;
    if (process.env.TEST) {
      return <span>{show && this.props.children}</span>;
    }
    return <BodyPortal>
      <ReactCSSTransitionGroup
        transitionName='transition'
        transitionEnterTimeout={200}
        transitionLeaveTimeout={200}>
        { show &&
        <div className='DialogContainer'>
          <div className='Backdrop' onClick={onBackdropClick}>
            <div className='Dialog mdl-dialog' onClick={(e) => e.stopPropagation()}>
              {this.props.children}
            </div>
          </div>
        </div>}
      </ReactCSSTransitionGroup>
    </BodyPortal>;
  }
}

export const DialogActions = (props) => <div className='DialogActions'>{props.children}</div>