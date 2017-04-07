import React, {Component, PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {BodyPortal} from './BodyPortal.jsx';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Provider} from 'react-redux';

import './Dialog.scss';

export class Dialog extends Component {
  static contextTypes = {store: React.PropTypes.object.isRequired};

  static propTypes = {show: PropTypes.bool, onBackdropClick: PropTypes.func};

  static defaultProps = {show: false, onBackdropClick: () => null};

  constructor(props, context) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.store = context.store;
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
            <Provider store={this.store}>
              <div className='Dialog mdl-dialog' onClick={(e) => e.stopPropagation()}>
                {this.props.children}
              </div>
            </Provider>
          </div>
        </div>}
      </ReactCSSTransitionGroup>
    </BodyPortal>;
  }
}

export const DialogActions = (props) => <div className='DialogActions'>{props.children}</div>