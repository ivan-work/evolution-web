import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {compose} from 'recompose';

import MUIAppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import {withStyles} from '@material-ui/core/styles';

import EvoLink from "../../components/EvoLink";

import AdminControlGroup from '../../components/AdminControlGroup.jsx'
import RoomControlGroup from "../../views/rooms/RoomControlGroup";
import GameScoreboardFinal from "../../views/game/ui/GameScoreboardFinal";
import AppBarMenu from "./AppBarMenu";
import IconMenu from '@material-ui/icons/Menu';
import {SettingVolumeMenuItem} from "./SettingVolume";
import {SettingUIv3MenuItem} from "./SettingUIv3";
import LinkProfile from "../../components/profile/LinkProfile";
import GuardUser from "../../components/GuardUser";

const styles = theme => ({
  title: {
    overflow: 'hidden'
    , minWidth: '1em'
  }
  , appBarMenu: {
    margin: '5px'
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
        <EvoLink to='/' variant="h4" color="inherit">{T.translate('App.Name')}</EvoLink>
        &nbsp;
        <Typography inline variant="caption" color="inherit">v{GLOBAL_VERSION}</Typography>
      </div>

      <GuardUser>
        <AppBarMenu className={classes.appBarMenu} text={<IconMenu />}>
          <SettingVolumeMenuItem />
          <SettingUIv3MenuItem />
          <LinkProfile />
        </AppBarMenu>
      </GuardUser>

      <div className={classes.portal}>
        <GuardUser>
          <RoomControlGroup />
          <AdminControlGroup />
          <GameScoreboardFinal />
        </GuardUser>
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