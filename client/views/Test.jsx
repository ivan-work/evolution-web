import React, {Component} from 'react';

import {Dialog} from './utils/Dialog.jsx';

export class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {show: true};
  }

  render() {
    return <div>
      <button onClick={() => this.setState({show: !this.state.show})}>Dialog</button>
      {this.state.show ? 'true' : 'false'}
      <Dialog show={this.state.show} onBackdropClick={() => this.setState({show: !this.state.show})}>
        hey
        <button onClick={() => this.setState({show: !this.state.show})}>close</button>
      </Dialog>
    </div>
  }
}