import React, {Component} from 'react';

export class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
  }

  onChange(value) {
    this.setState({value});
  }

  render() {
    return <div>
      <input type='text' value={this.state.value} onChange={(e) => this.onChange(e.target.value)}/>
    </div>
  }
}