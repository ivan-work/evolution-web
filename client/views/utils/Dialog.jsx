import React from 'react';
import PropTypes from 'prop-types';
import {Portal} from './Portal.jsx';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import './Dialog.scss';

export class Dialog extends React.PureComponent {
  static propTypes = {show: PropTypes.bool, onBackdropClick: PropTypes.func};

  static defaultProps = {show: false, onBackdropClick: () => null};

  render() {
    const {show, onBackdropClick, children} = this.props;
    if (process.env.TEST) {
      return <span>{show && children}</span>;
    }
    return <Portal target='body'>
      <CSSTransitionGroup
        transitionName='transition'
        transitionEnterTimeout={200}
        transitionLeaveTimeout={200}>
        { show &&
        <div className='DialogContainer'>
          <div className='Backdrop' onClick={onBackdropClick}>
            <div className='Dialog mdl-dialog' onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          </div>
        </div>}
      </CSSTransitionGroup>
    </Portal>;
  }
}

export const DialogActions = (props) => <div className='DialogActions'>{props.children}</div>