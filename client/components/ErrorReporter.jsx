import React from 'react';
import { compose, defaultProps} from 'recompose';
import { connect } from 'react-redux';

import Snackbar from '@material-ui/core/Snackbar';

import {actionError} from '../../shared/actions/actions';

const TIMEOUT = 10e3;
const anchorOrigin = {vertical: 'bottom', horizontal: 'right'};

export default compose(
  defaultProps({
    anchorOrigin
    // , autoHideDuration: TIMEOUT
  })
  , connect(
    (state) => ({
      message: state.error && state.error.message
      , open: !!state.error
    }),
    (dispatch) => ({
      onClose: () => dispatch(actionError(null))
      , onClick: () => dispatch(actionError(null))
    })
  )
  // , omitProps(['classes', 'close'])
)(Snackbar);
