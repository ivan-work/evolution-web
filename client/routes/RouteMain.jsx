import React, {Fragment} from 'react';
import T from 'i18n-react';
import {branch, compose, renderNothing} from 'recompose';
import {connect} from 'react-redux';

import UsersList from '../views/utils/UsersList.jsx';
import RoomsList from '../views/rooms/RoomsList.jsx';
import Chat from '../views/Chat.jsx';
import {Portal} from '../views/utils/Portal.jsx';
import ControlGroup from '../views/utils/ControlGroup';
import RoomControlGroup from '../views/rooms/RoomControlGroup.jsx';

import {roomCreateRequest} from '../../shared/actions/actions';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button/Button";
import IconButton from "@material-ui/core/IconButton";
import IconCreateRoom from "@material-ui/icons/AddCircle";

const styles = theme => ({
  root: {
    flex: '1'
    , flexWrap: 'wrap-reverse'
  }
  , column: {}
  , columnPaper: {
    padding: theme.spacing.unit
    , flex: '1'
  }
  , columnTitle: {
    whiteSpace: 'nowrap'
  }
  , rowOnline: {
    marginBottom: theme.spacing.unit / 2
    , padding: theme.spacing.unit
  }
});

const MainPageControlGroup = compose(
  connect(
    (state) => ({room: state.get('room')})
    , (dispatch) => ({$createRequest: () => dispatch(roomCreateRequest())})
  )
  , branch(({room}) => !room, renderNothing)
)(({$createRequest}) => <ControlGroup name={T.translate('App.Rooms.Rooms')}>
  <Button id="Rooms$Create" onClick={$createRequest} color={"inherit"}>{T.translate('App.Rooms.$Create')}</Button>
</ControlGroup>);

const CreateRoom = compose(
  connect(
    (state) => ({room: state.get('room')})
    , (dispatch) => ({$createRequest: () => dispatch(roomCreateRequest())})
  )
  // , branch(({room}) => !room, renderNothing)
)(({$createRequest}) => <IconButton
  color={"secondary"}
  onClick={$createRequest}>
  <IconCreateRoom fontSize={"large"}/>
</IconButton>);

const OnlineWidget = connect((state) => ({
  online: state.online.toList()
}))(({online}) => (<Fragment>
  <Typography variant="h4">{T.translate('App.Online')}:</Typography>
  <Typography>
    {online.map((user, index) => <Fragment key={user.id}>
      {!!index && ', '}
      {user.login}
    </Fragment>)}
  </Typography>
</Fragment>));

export const RouteMain = ({classes}) => {
  // console.log();
  return (
    <Fragment>
        <Paper className={classes.rowOnline}>
          <OnlineWidget/>
        </Paper>
      <Grid className={classes.root} container spacing={8}>
        <Grid xs item container className={classes.column}>
          <Paper className={classes.columnPaper}>
            <Typography className={classes.columnTitle} variant="h4">{T.translate('App.Rooms.Rooms')}: <CreateRoom/>
            </Typography>
            <RoomsList/>
          </Paper>
        </Grid>
        <Grid xs item container className={classes.column}>
          <Paper className={classes.columnPaper}>
            <Chat chatTargetType='GLOBAL'/>
          </Paper>
        </Grid>
      </Grid>
    </Fragment>
  );
};

// render() {
//   return <div className="Rooms">
//     <Portal target='header'>
//       <ControlGroup name={T.translate('App.Rooms.Rooms')}>
//         <Button id="Rooms$Create" onClick={this.props.$createRequest}>{T.translate('App.Rooms.$Create')}</Button>
//       </ControlGroup>
//       {this.props.room && <RoomControlGroup/>}
//     </Portal>
//     <div className='flex-row'>
//       <Card shadow={0} className='list-rooms'>
//         <CardTitle><h4>{T.translate('App.Rooms.Rooms')}:</h4></CardTitle>
//         <CardText>
//           <RoomsList/>
//         </CardText>
//       </Card>
//       <Card shadow={0} className='chat'>
//         <CardTitle><h4>{T.translate('App.Chat.Label')}:</h4></CardTitle>
//         <CardText>
//           <Chat chatTargetType='GLOBAL'/>
//         </CardText>
//       </Card>
//       <Card shadow={0} className='list-online'>
//         <CardTitle><h4>{T.translate('App.Online')}:</h4></CardTitle>
//         <CardText>
//           <UsersList list={this.props.online}/>
//         </CardText>
//       </Card>
//     </div>
//   </div>;
// }

export default compose(
  withStyles(styles)
)(RouteMain);
