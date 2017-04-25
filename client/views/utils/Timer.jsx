import React from 'react';
import PropTypes from 'prop-types'

// function for testing wrong client time;
import TimeService from '../../services/TimeService';

export class Timer extends React.Component {
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
    if (this.$isMounted) {
      const time = start + duration - TimeService.getServerTimestamp();
      if (time > 0) {
        this.setState({time});
        window.setTimeout(this.updateTime, 500)
      } else if (time < 0) {
        this.setState({time: 0});
        if (onEnd) onEnd();
      }
    }
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