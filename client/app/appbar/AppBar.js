import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {compose} from 'recompose';

import MUIAppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import {withStyles} from '@material-ui/core/styles';

import AdminControlGroup from '../../components/AdminControlGroup.jsx'
import {PortalTarget} from "../../views/utils/PortalTarget"
import {TranslationSwitchView} from '../../components/TranslationSwitch.jsx'

import SettingVolume from "./SettingVolume";
import SettingUIv3 from "./SettingUIv3";
import RoomControlGroup from "../../views/rooms/RoomControlGroup";
import {Portal} from "../../views/utils/Portal";
import Link from "@material-ui/core/Link/Link";
import {redirectTo} from "../../../shared/utils/history";
import Hidden from "@material-ui/core/Hidden";

const styles = theme => ({
  title: {
    overflow: 'hidden'
    , minWidth: '1em'
  }
  , portal: {
    whiteSpace: 'nowrap'
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
      <div className={classes.title}>
        <Link onClick={() => redirectTo('/')}
              variant="h4"
              color="inherit">
            {T.translate('App.Name')}
        </Link>
        &nbsp;
        <Typography inline variant="caption" color="inherit">v{GLOBAL_VERSION}</Typography>
      </div>

      <SettingVolume/>

      <SettingUIv3/>

      <div className={classes.portal}>
        <RoomControlGroup/>
        <AdminControlGroup/>
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