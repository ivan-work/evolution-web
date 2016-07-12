import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as MDL from 'react-mdl';

export const RoomsList = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    return <ul className="RoomsList">
      {Object.keys(this.props.map).map((roomId) => <li key={roomId}>{this.props.map[roomId].name}</li>)}
    </ul>;
  }
});
