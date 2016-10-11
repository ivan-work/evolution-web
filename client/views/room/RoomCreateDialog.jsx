import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import * as MDL from 'react-mdl';
import {connect} from 'react-redux';
import cn from 'classnames';

import {Dialog, DialogActions} from '../utils/Dialog.jsx';

const INITIAL_STATE = {
  show: false
  , name: Math.floor(Math.random() * 0xFFFFFF)
};

export class RoomCreateDialog extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = INITIAL_STATE;
  }

  static propTypes = {
    onCreateRoom: React.PropTypes.func.isRequired
  };

  render() {
    return <span>
        <MDL.Button id="Rooms$create" onClick={() => this.setState({show: true})}>Create room</MDL.Button>
        <Dialog show={this.state.show}>
          <MDL.DialogTitle>New room</MDL.DialogTitle>
          <MDL.DialogContent>
            <MDL.Textfield floatingLabel label='Name' value={this.state.name} onChange={(e) => this.setState({name: e.target.value})}/>
          </MDL.DialogContent>
          <DialogActions>
            <MDL.Button type='button' raised primary onClick={() => {
              this.props.onCreateRoom({
                name: this.state.name
              });
              this.setState({show: false});
            }}>Create</MDL.Button>
            <MDL.Button type='button' raised onClick={() => this.setState({show: false})}>Cancel</MDL.Button>
          </DialogActions>
        </Dialog>
      </span>;
  }
}