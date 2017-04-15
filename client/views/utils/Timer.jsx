import React, {Component, PropTypes} from 'react';

// function for testing wrong client time;
const getDate = () => Date.now() - 10 * 60 * 1000;
import TimeService from '../../services/TimeService';

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
    const {start, duration, onEnd} = nextProps || this.props;
    TimeService.getTime()
      .then((timestamp) => {
        if (this.$isMounted) {
          const time = start + duration - timestamp;
          if (time > 0) {
            this.setState({time});
            window.setTimeout(this.updateTime, 500)
          } else {
            this.setState({time: 0});
            if (onEnd) onEnd();
          }
        }
      });
  }

  componentWillReceiveProps(nextProps) {
    this.updateTime(nextProps);
  }

  componentDidMount() {
    this.$isMounted = true;
    window.setTimeout(this.updateTime, 500)
  }

  componentWillUnmount() {
    this.$isMounted = false;
  }

  render() {
    return <span>{this.renderTime(this.state.time)}</span>
  }

  renderTime(time) {
    return TimeService.formatTimeOfTimer(time);
  }
}