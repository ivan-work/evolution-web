import React, {Component} from 'react';

export class Portal extends Component {
  static propTypes = {
    target: React.PropTypes.string.isRequired
  };

  static contextTypes = {
    portalsContext: React.PropTypes.object.isRequired
  };

  componentDidMount() {
    this.id = Math.floor(Math.random() * 0xFFFFFF);
    this.target = this.context.portalsContext[this.props.target];
    if (this.target) {
      this.target.add(this);
    } else {
      throw new Error('Cannot find target' + this.props.target)
    }
  }

  componentWillUnmount() {
    if (this.target) {
      this.target.remove(this);
    }
  }

  componentDidUpdate() {
    if (this.target) {
      this.target.update();
    }
  }

  renderChildren() {
    return <span>{this.props.children}</span>;
  }

  render() {
    return <span></span>
  }
}