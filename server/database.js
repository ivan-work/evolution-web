const {MongoClient} = require('mongodb');

const result = {};

if (process.env.NODE_ENV !== 'test')
  result.ready = MongoClient.connect(
    process.env.MONGO_URL
    , {useNewUrlParser: true}
  )
    .then(client => {
      result.db = client.db();
    })
    .catch(console.error);

export default result;

