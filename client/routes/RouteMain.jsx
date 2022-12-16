import React from 'react';
import T from 'i18n-react';

import {compose} from 'recompose';
import {connect} from 'react-redux';
import withStyles from "@material-ui/core/styles/withStyles";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import IconCreateRoom from "@material-ui/icons/AddCircle";

import EvoPaper from "../views/utils/EvoPaper";
import RoomsList from '../views/rooms/RoomsList';
import Chat from '../views/Chat.jsx';
import User from "../views/utils/User";
import WhiteTooltip from "../views/utils/WhiteTooltip";

import {roomCreateRequest} from '../../shared/actions/actions';

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
    <IconCreateRoom fontSize="large"/>
  </IconButton>
));

const OnlineWidget = connect((state) => ({
  online: state.online.toList()
}))(({online}) => (
  <Tooltip
    placement='bottom-start'
    title={(
      <div>
        {online.map((user, index) => (
          <React.Fragment key={user.id}>
            {!!index && ', '}
            <User id={user.id}/>
          </React.Fragment>
        ))}
      </div>
    )}>
    <Typography className='OnlineWidget'>
      <span className='h4 title'>{T.translate('App.Online')}: </span>
      <span className='h4 text'>{online.size}</span>
    </Typography>
  </Tooltip>
));

export const RouteMain = ({classes}) => (
  <Grid className='flex' direction='column' container>
    <Grid className='flex' container item>
      <Grid xs container item>
        <EvoPaper className={classes.columnPaper}>
          <Typography
            className={classes.columnTitle}
            variant="h4">
            {T.translate('App.Rooms.Rooms')}: <CreateRoom/>
          </Typography>
          <div className={classes.roomsListWrapper}>
            <RoomsList/>
          </div>
        </EvoPaper>
      </Grid>
      <Grid direction='column' xs container item>
        <EvoPaper>
          <OnlineWidget/>
        </EvoPaper>
        <EvoPaper className={classes.columnPaper}>
          <Chat chatTargetType='GLOBAL' maxTime={3600e3 /* 1 HOUR */}/>
        </EvoPaper>
      </Grid>
    </Grid>
  </Grid>
);

export default compose(
  withStyles(styles)
)(RouteMain);
