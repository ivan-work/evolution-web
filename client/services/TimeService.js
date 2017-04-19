import moment from 'moment';

export class TimeService {
  offset = 0;

  setOffset(serverTime) {
    this.offset = serverTime - this.getLocalTimestamp();
  }

  getLocalTimestamp() {
    return moment.now();
  }

  getServerTimestamp() {
    return this.getLocalTimestamp() + this.offset;
  }

  formatTimeOfTimer(timestamp) {
    return moment.unix(timestamp / 1000).format('mm:ss')
  }

  formatTimeOfDay(timestamp) {
    return moment.unix(timestamp / 1000).format('HH:mm:ss')
  }
}

export default new TimeService();