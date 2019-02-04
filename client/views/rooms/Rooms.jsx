import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';

// import {Button, Card, CardTitle, CardText} from 'react-mdl';
import UsersList from '../utils/UsersList.jsx';
import RoomsList from './RoomsList.jsx';
import Chat from './../Chat.jsx';
import {Portal} from './../utils/Portal.jsx';
import {ControlGroup} from './../utils/ControlGroup.jsx';
import RoomControlGroup from './RoomControlGroup.jsx';

import {roomCreateRequest} from '../../../shared/actions/actions';

export class Rooms extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (null);
  }

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
}

export const RoomsView = connect(
  (state) => {
    // console.log(state.get('online').keySeq().toList().toJS());
    return {
      // room: state.get('room')
      // , online: state.get('online').keySeq().toList()
    }
  }
  , (dispatch) => ({
    $createRequest: () => dispatch(roomCreateRequest())
  })
)(Rooms);
