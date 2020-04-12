import React, {Fragment} from 'react';
import T from 'i18n-react';

import {branch, compose, renderNothing} from 'recompose';
import {connect} from 'react-redux';
import withStyles from "@material-ui/core/styles/withStyles";

import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button/Button";
import IconButton from "@material-ui/core/IconButton";
import IconCreateRoom from "@material-ui/icons/AddCircle";

import RoomsList from '../views/rooms/RoomsList';
import Chat from '../views/Chat.jsx';
import ControlGroup from '../views/utils/ControlGroup';
import IgnoreUnignoreTooltip from "../components/IgnoreUnignoreTooltip";

import {roomCreateRequest} from '../../shared/actions/actions';
import EvoPaper from "../views/utils/EvoPaper";
import User from "../views/utils/User";


const styles = theme => ({
  columnPaper: {
    padding: theme.spacing()
    , flex: '1'
    , display: 'flex'
    , flexFlow: 'column nowrap'
  }
  , columnTitle: {
    whiteSpace: 'nowrap'
  }
  , roomsListWrapper: {
    flex: '1 1 0'
    , overflowY: 'auto'
  }
});

const CreateRoom = compose(
  connect(
    (state) => ({room: state.get('room')})
    , (dispatch) => ({$createRequest: () => dispatch(roomCreateRequest())})
  )
  // , branch(({room}) => !room, renderNothing)
)(({$createRequest}) => (
  <IconButton
    color="secondary"
    onClick={$createRequest}>
    <IconCreateRoom fontSize="large" />
  </IconButton>
));

const OnlineWidget = connect((state) => ({
  online: state.online.toList()
}))(({online}) => (
  <Fragment>
    <Typography variant="h4">{T.translate('App.Online')}:</Typography>
    <Typography>
      {online.map((user, index) => <Fragment key={user.id}>
        {!!index && ', '}
        <IgnoreUnignoreTooltip userId={user.id}><User id={user.id}/></IgnoreUnignoreTooltip>
      </Fragment>)}
    </Typography>
  </Fragment>
));

export const RouteMain = ({classes}) => (
  <Grid className='flex' direction='column' container spacing={1}>
    <Grid item>
      <EvoPaper>
        <OnlineWidget />
      </EvoPaper>
    </Grid>
    <Grid className='flex' container item spacing={1}>
      <Grid xs container item>
        <Paper className={classes.columnPaper}>
          <Typography
            className={classes.columnTitle}
            variant="h4">
            {T.translate('App.Rooms.Rooms')}: <CreateRoom />
          </Typography>
          <div className={classes.roomsListWrapper}>
            <RoomsList />
          </div>
        </Paper>
      </Grid>
      <Grid xs container item>
        <Paper className={classes.columnPaper}>
          <Chat chatTargetType='GLOBAL' />
        </Paper>
      </Grid>
    </Grid>
  </Grid>
);

export default compose(
  withStyles(styles)
)(RouteMain);
