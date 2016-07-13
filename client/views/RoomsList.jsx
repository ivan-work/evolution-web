import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as MDL from 'react-mdl';

export const RoomsList = React.createClass({
  mixins: [PureRenderMixin]
  , render: function () {
    console.log("p", this.props.onItemClick);
    return <MDL.List className="RoomsList">
      {Object.keys(this.props.map).map((roomId) =>
      <MDL.ListItem key={roomId}>
        {this.props.onItemClick
          ? (
        <a href="#" data-id={roomId} onClick={this.props.onItemClick}>
          {this.props.map[roomId].name}
        </a>)
          : (this.props.map[roomId].name)
          }
      </MDL.ListItem>)}
    </MDL.List>;
  }
});
