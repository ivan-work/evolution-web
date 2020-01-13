import React from "react";
import {connect} from 'react-redux';
import {branch, compose, renderNothing} from 'recompose';
import get from 'lodash/fp/get';

export default compose(
  connect(
    (state, props) => ({noUser: !state.user})
  )
  , branch(get('noUser'), renderNothing)
)(({children}) => <>{children}</>)