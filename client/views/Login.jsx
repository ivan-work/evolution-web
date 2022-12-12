import React from 'react';
import T from 'i18n-react';
import {compose} from 'recompose';
import {connect} from 'react-redux';


import {Redirect} from 'react-router';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import withStyles from "@material-ui/core/styles/withStyles";

import TextLogin from "./auth/TextLogin";
import VKAPILogin from './auth/VKAPILogin';
import TranslationSwitch from "../components/TranslationSwitch";

const styles = theme => ({
  loginOption: {
    padding: theme.spacing(3)
    , margin: theme.spacing()
  }
});


export const Login = ({classes, isAuthenticated}) => {
  return (
    <Grid container
          justifyContent="space-evenly"
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
      <Grid item>
        <Paper className={classes.loginOption}>
          <TranslationSwitch/>
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