import React from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {Map} from 'immutable';

import {Button, Card, CardTitle, CardText} from 'react-mdl';
import {UsersList} from './../UsersList.jsx';
import RoomsList from './RoomsList.jsx';
import {Portal} from './../utils/Portal.jsx';
import {ControlGroup} from './../utils/ControlGroup.jsx';
import RoomControlGroup from './RoomControlGroup.jsx';

import {roomCreateRequest} from '../../../shared/actions/actions';
import './Rooms.scss';

export class Rooms extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="Rooms">
      <Portal target='header'>
        <ControlGroup name={T.translate('App.Rooms.Rooms')}>
          <Button id="Rooms$Create" onClick={this.props.$createRequest}>{T.translate('App.Rooms.$Create')}</Button>
        </ControlGroup>
        {!this.props.room ? null : <RoomControlGroup/>}
      </Portal>
      <h1 className='greeting'>
        {T.translate('App.Rooms.Greeting')}, {this.props.username}
      </h1>
      <div className='flex-row'>
        <Card shadow={0} className='list-rooms'>
          <CardTitle><h4>{T.translate('App.Rooms.Rooms')}:</h4></CardTitle>
          <CardText>
            <RoomsList/>
          </CardText>
        </Card>
        <Card shadow={0} className='list-online'>
          <CardTitle><h4>{T.translate('App.Online')}:</h4></CardTitle>
          <CardText>
            <UsersList list={this.props.online}/>
          </CardText>
        </Card>
      </div>
    </div>;
  }
}

export const RoomsView = connect(
  (state) => {
    //console.log(state.toJS());
    return {
      username: state.getIn(['user', 'login'], '%USERNAME%')
      , online: state.getIn(['online'], [])
    }
  }
  , (dispatch) => ({
    $createRequest: () => dispatch(roomCreateRequest())
  })
)(Rooms);
