import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {compose} from 'recompose';

import {Router} from "react-router";
import routes from "../routes/index";

import CssBaseline from '@material-ui/core/CssBaseline';
import {withStyles} from '@material-ui/core/styles';

import AppBar from './appbar/AppBar';
import {AdminPanelView} from '../components/AdminPanel.jsx'
import {PortalsContext, PortalTarget} from '../views/utils/PortalTarget.jsx'
import {TranslationSwitchView} from '../components/TranslationSwitch.jsx'
import ErrorReporter from '../components/ErrorReporter.jsx';

const styles = theme => ({
  root: {
    display: 'flex'
  }
  , appBarSpacer: theme.mixins.toolbar
  , content: {
    flexGrow: 1
    //, padding: theme.spacing.unit
    , height: '100vh'
    , overflow: 'hidden'

    , display: 'flex'
    , flexDirection: 'column'
  }
});

export const App = ({children, location, sound, appChangeSound, classes, history}) => (
  <div className={classes.root}>
    <CssBaseline/>
    <AppBar/>
    <ErrorReporter/>
    <div className={classes.content}>
      <div className={classes.appBarSpacer}/>
      <Router history={history}>
        {routes}
      </Router>
    </div>
    <svg width="100%" height="100%"
         style={{position: 'absolute', left: '0', top: '0', zIndex: 100, pointerEvents: 'none'}}>
      <PortalTarget name='game-svg' container='g'/>
    </svg>
    <div width="100%" height="100%"
         style={{position: 'absolute', left: '0', top: '0', zIndex: 100, pointerEvents: 'none'}}>
      <PortalTarget name='tooltips'/>
    </div>
    {/*<AdminPanelView location={location}/>*/}
  </div>
);

export const AppView = compose(
  PortalsContext
  , withStyles(styles)
)(App);

export default AppView;