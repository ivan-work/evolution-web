import React, {Component, PropTypes} from 'react';

export class Timer extends Component {
  static propTypes = {
    start: PropTypes.number.isRequired
    , duration: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.state.time = props.start;
    this.updateTime = this.updateTime.bind(this);
  }

  updateTime(nextProps) {
    const {start, duration} = nextProps || this.props;
    if (this.$isMounted) {
      //this.setState(Date.now() + this.props.end - this.props.start);
      const time = start + duration - Date.now();
      if (time > 0) {
        this.setState({time});
        window.setTimeout(this.updateTime, 100)
      } else {
        this.setState({time: 0});
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    this.updateTime(nextProps);
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