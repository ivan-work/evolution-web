const {MongoClient} = require('mongodb');

const result = {};

if (process.env.NODE_ENV !== 'test')
  result.ready = MongoClient.connect(process.env.MONGO_URL)
    .catch(console.error)
    .then(db => {
      result.db = db;
    });

export default result;

