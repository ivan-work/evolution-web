import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as MDL from 'react-mdl';

export const RoomsList = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    return <ul className="RoomsList">
      {this.props.list.map((room) => <li key={room.id}>{room.name}</li>)}
    </ul>;
  }
});
