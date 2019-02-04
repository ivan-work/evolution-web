import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {compose} from 'recompose';

import MUIAppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import {withStyles} from '@material-ui/core/styles';

import Scrollbar from 'react-custom-scrollbars';

import {AdminPanelView} from '../../components/AdminPanel.jsx'
import {PortalTarget} from "../../views/utils/PortalTarget"
import {TranslationSwitchView} from '../../components/TranslationSwitch.jsx'

import SettingVolume from "./SettingVolume";
import RoomControlGroup from "../../views/rooms/RoomControlGroup";
import {Portal} from "../../views/utils/Portal";
import Link from "@material-ui/core/Link/Link";
import {redirectTo} from "../../../shared/utils/history";

const styles = theme => ({
  title: {
    cursor: 'pointer'
  }
  , portal: {
    // overflowY: 'hidden'
    // , overflowX: 'auto'
  }
  , spacer: {flexGrow: 1}
  , button: {
    whiteSpace: 'nowrap'
    , margin: theme.spacing.unit
    , flex: theme.style.flex.off
  }
});

export const AppBar = ({classes}) => (
  <MUIAppBar>
    <Toolbar>
      {/*<TranslationSwitchView/>*/}

      <Link onClick={() => redirectTo('/')}
            className={classes.title}
            variant="h4"
            color="inherit">
        {T.translate('App.Name')}
      </Link>
      &nbsp;
      <Typography variant="caption" color="inherit" className={classes.title}>v{GLOBAL_VERSION}</Typography>

      <SettingVolume/>

      <div className={classes.portal}>
        <RoomControlGroup/>
        {/*<Scrollbar>*/}
        {/*<PortalTarget name='header'/>*/}
        {/*</Scrollbar>*/}
      </div>

      <span className={classes.spacer}>&nbsp;</span>

      <Button className={classes.button}
              target="blank"
              variant="outlined"
              color="secondary"
              href="https://vk.com/evolveonline">
        {T.translate('App.Misc.VKGroup')}
      </Button>

      <Button className={classes.button}
              target="blank"
              color="inherit"
              href={T.translate('App.Misc.FAQ_HREF')}>
        {T.translate('App.Misc.FAQ')}
      </Button>
    </Toolbar>
  </MUIAppBar>
);

export default withStyles(styles)(AppBar);