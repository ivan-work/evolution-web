import './globals';

database.ready.then(() => {
  console.log(database.db.users)
  console.log(database.db.collection.users)
  // return database.db.collection('users').insertOne({
  //   name: 'Fen1kz', auth: {
  //     type: 'VK'
  //     , user_id: 624571
  //     , access_token: null
  //     , expires_in: 123
  //   }
  // });

  // database.db.collection('users').findOne({'auth.type': 'VK', 'auth.user_id': 624571}, ['name', 'auth'])
  //   .then((user) => {
  //     console.log(user)
  //
  //   }).catch(console.error);
  //
  // database.db.collection('users').updateOne({'auth.type': 'VK', 'auth.id': 624571}, {
  //   $set: {'auth.access_token': 'NEW TOKEN'}
  // })
  //   .then((user) => {
  //     console.log(user)
  //   }).catch(console.error);

  // db$registerUser(first_name + ' ' + last_name, {
//   type: AUTH_TYPE.VK
//   , 624571
//   , null
//   , 123
// });
});
