import React from 'react';
import {connect} from 'react-redux';
import {Snackbar} from 'react-mdl';
import {actionError} from '../../shared/actions/actions';

export class ErrorReporter extends React.Component {
  constructor(props) {
    super(props);
    this.clearError = this.props.clearError.bind(this);
  }

  render() {
    const { error } = this.props;
    return (<Snackbar
        active={!!error}
        onClick={this.clearError}
        onTimeout={this.clearError}
        action='Ok'
      >Error: {error && error.message}</Snackbar>
    );
  }
}

export default connect(
  (state) => ({
    error: state.getIn(['error'])
  }),
  (dispatch) => ({
    clearError: () => dispatch(actionError(null))
  })
)(ErrorReporter);
