//import React from 'react';
//import ReactDOM from 'react-dom';
//import {
//  renderIntoDocument,
//  scryRenderedDOMComponentsWithTag,
//  Simulate
//} from 'react-addons-test-utils';
//import {List, Map} from 'immutable';
//import {UserRecord} from '~/shared/models/User';
//import {UsersList} from './UsersList.jsx';
//
//
//
//describe('UsersList', () => {
//  it('displays list', () => {
//    const users = List([{id: 0, login: 'user0'}, {id: 1, login: 'user1'}, {id: 2, login: 'user2'}]);
//
//    const component = renderIntoDocument(
//      <UsersList users={users} />
//    );
//
//    const entries = scryRenderedDOMComponentsWithTag(component, 'li');
//    expect(entries.length).to.equal(3);
//
//    const [user0, user1, user2] = entries.map(e => e.textContent);
//    expect(user0).to.contain('user0');
//    expect(user1).to.contain('user1');
//    expect(user2).to.contain('user2');
//  });
//});