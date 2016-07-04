import React from 'react';
import ReactDOM from 'react-dom';
import {
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag,
  Simulate
} from 'react-addons-test-utils';
import {List, Map} from 'immutable';
import {RoomsList} from './RoomsList.jsx';


describe('UsersList', () => {
  it('displays list', () => {
    const list = List([{id: 0, name: 'room0'}, {id: 1, name: 'room1'}, {id: 2, name: 'room2'}]);

    const component = renderIntoDocument(
      <RoomsList list={list}/>
    );

    const entries = scryRenderedDOMComponentsWithTag(component, 'li');
    expect(entries.length).to.equal(3);

    const [item0, item1, item2] = entries.map(e => e.textContent);
    expect(item0).to.contain('room0');
    expect(item1).to.contain('room1');
    expect(item2).to.contain('room2');
  });
});