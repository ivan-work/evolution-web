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
    const {start, duration} = nextProps || this.props;
    TimeService.getTime()
      .then((timestamp) => {
        if (this.$isMounted) {
          const time = start + duration - timestamp;
          if (time > 0) {
            this.setState({time});
            window.setTimeout(this.updateTime, 100)
          } else {
            this.setState({time: 0});
          }
        }
      });
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
    let ms = time % 1000;
    time = (time - ms) / 1000;
    let s = time % 60;
    time = (time - s) / 60;
    let m = time % 60;
    time = (time - m) / 60;
    let h = time % 60;
    if (h < 10) h = '0' + h;
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    return (h != '00' ? h + ':' : '') + m + ':' + s;
  }
}