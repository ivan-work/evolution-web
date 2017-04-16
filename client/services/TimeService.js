import moment from 'moment';

export class TimeService {
  offset = 5000;

  setOffset(serverTime) {
    console.log('setting offset', this.getLocalTimestamp(), serverTime, this.getLocalTimestamp() - serverTime);
    this.offset = serverTime - this.getLocalTimestamp();
    console.log('so, serverTime is ', this.getServerTimestamp());
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