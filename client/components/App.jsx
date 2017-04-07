import React from 'react';
import {ConnectionStateContainer} from './ConnectionState';

//<ConnectionStateContainer />
export default React.createClass({
  render: function () {
    return <div>
      {this.props.children}
    </div>
  }
});
