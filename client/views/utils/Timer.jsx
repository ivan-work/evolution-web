import React, {Component, PropTypes} from 'react';

export class Timer extends Component {
  static propTypes = {
    start: PropTypes.number.isRequired
    , end: PropTypes.number.isRequired
  };

  constructor(...args) {
    super(...args);
    this.state = {};
    this.state.time = args[0].start;
    this.updateTime = this.updateTime.bind(this);
  }

  updateTime() {
    if (this.$isMounted) {
      //this.setState(Date.now() + this.props.end - this.props.start);
      const time = this.props.end - Date.now();
      if (time > 0) {
        this.setState({time});
        window.setTimeout(this.updateTime, 100)
      } else {
        this.setState({time: 0});
      }
    }
  }

  componentDidMount() {
    this.$isMounted = true;
    window.setTimeout(this.updateTime, 100)
  }

  componentWillUnmount() {
    this.$isMounted = false;
  }

  render() {
    return <span>{this.renderTime(this.state.time)}</span>
  }

  renderTime(time) {
    return (time / 1000).toFixed(1);
  }
}