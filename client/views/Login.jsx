import React from 'react';
import T from 'i18n-react';
import {compose} from 'recompose';
import {connect} from 'react-redux';


import {Redirect} from 'react-router';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {withStyles} from "@material-ui/core/styles";

import TextLogin from "./auth/TextLogin";
import VKAPILogin from './auth/VKAPILogin';

const styles = theme => ({
  loginOption: {
    padding: theme.spacing.unit * 3
    , margin: theme.spacing.unit
  }
});


export const Login = ({classes, isAuthenticated}) => {
  return (
    <Grid container
          justify="space-evenly"
          alignItems="center"
    >
      {isAuthenticated && <Redirect to={'/'}/>}
      <Grid item>
        <Paper className={classes.loginOption}>
          <TextLogin/>
        </Paper>
      </Grid>
      <Grid item>
        <Paper className={classes.loginOption}>
          <VKAPILogin/>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default compose(
  withStyles(styles)
  , connect(
    (state) => ({
      isAuthenticated: !!state.user
    })
  )
)(Login);