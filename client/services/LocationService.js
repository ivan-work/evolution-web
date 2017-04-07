export default {
  getLocationQuery: () => window.location.search.substr(1).split('&').reduce((result, kv) => {
    const [k, v] = kv.split('=');
    return {...result, [k]: v || true};
  }, {})
}