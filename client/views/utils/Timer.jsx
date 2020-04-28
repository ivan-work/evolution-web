import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

// function for testing wrong client time;
import TimeService from '../../services/TimeService';

import './Timer.scss';
import {appPlaySound, AudioFileName} from "../../actions/app";

const getSeconds = (time) => Math.floor(time / 1e3);

class Timer extends React.Component {
  static propTypes = {
    start: PropTypes.number.isRequired
    , duration: PropTypes.number.isRequired
    , warning: PropTypes.number
    , sound: PropTypes.bool
  };

  static defaultProps = {
    warning: 11e3
  };

  timeout = void 0;

  constructor(props) {
    super(props);
    this.state = {};
    this.state.time = props.start + props.duration - TimeService.getServerTimestamp();
  }

  updateTime = (nextProps) => {
    const {start, duration} = nextProps || this.props;
    const time = start + duration - TimeService.getServerTimestamp();
    if (time > 0) {
      this.setState({time});
      this.timeout = window.setTimeout(this.updateTime, 500)
    } else if (time < 0) {
      this.setState({time: 0});
    }
  };

  componentDidUpdate(prevProps, {time}) {
    if (
      this.props.start !== prevProps.start
      || this.props.duration !== prevProps.duration
    ) {
      window.clearTimeout(this.timeout);
      this.updateTime();
    }
    if (
      this.props.sound
      && this.state.time
      && this.state.time <= this.props.warning
      && getSeconds(this.state.time) !== getSeconds(time)
    ) {
      this.props.appPlaySound(AudioFileName.CLOCK_TICK);
    }
  }

  componentDidMount() {
    this.timeout = window.setTimeout(this.updateTime, 500)
  }

  componentWillUnmount() {
    window.clearTimeout(this.timeout);
  }

  render() {
    const className = cn(
      'Timer', {
        'Timer_Warning': this.state.time <= this.props.warning
      });
    return <span className={className}>{this.renderTime(this.state.time)}</span>
  }

  renderTime(time) {
    return TimeService.formatTimeOfTimer(time);
  }
}

export default connect(null, {appPlaySound})(Timer);