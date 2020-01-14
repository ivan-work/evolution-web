import React from "react";
import T from "i18n-react";
import {connect} from 'react-redux';
import {branch, compose, renderNothing} from 'recompose';

import MenuItem from "@material-ui/core/MenuItem";
import {Link} from "react-router-dom";

export const LinkBody = ({closeMenu}) => <Link to='/profile' onClick={closeMenu} color='inherit' style={{textDecoration: 'none'}}>
  <MenuItem>
    {T.translate('App.Settings.Profile')}
  </MenuItem>
</Link>;

export default compose(
  connect(
    (state, props) => ({authType: state.user.authType})
  )
  , branch(({authType}) => !authType, renderNothing)
)(LinkBody)