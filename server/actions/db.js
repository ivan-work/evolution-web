import {AUTH_TYPE} from '../../shared/constants';
import database from '../database';
const db = database.db;


export const db$findUser = (authType, authId) => {
  return db.collection('users').findOne({'auth.type': authType, 'auth.id': authId}, ['name', 'auth']);
};

export const db$registerUser = (user) => {
  return db.collection('users').insertOne(user);
};

export const db$updateUser = (authType, authId, query) => {
  return db.collection('users').updateOne({'auth.type': authType, 'auth.id': authId}, query);
};
