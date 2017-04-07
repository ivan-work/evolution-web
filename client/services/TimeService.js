export class TimeService {
  constructor() {
    this.offset = window.fetch('/api/time')
      .then(r => r.json())
      .then((serverTime) => serverTime - this.getRawTime())
  }

  getRawTime() {
    return Date.now() - 10 * 60 * 1000;
  }

  getTime() {
    return this.offset
      .then(offset => this.getRawTime() + offset)
  }
}

export default new TimeService();