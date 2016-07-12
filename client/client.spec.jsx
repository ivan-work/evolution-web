import React from 'react';
import {Map} from 'immutable';
import {Root} from './components/app/Root.jsx';
import {createMemoryHistory} from 'react-router';
import {loginUserRequest} from '~/shared/actions/actions';

describe('Client: ', () => {
  it('Should redirect to login', () => {
    const store = mockClientStore();

    const $root = mount(<Root store={store} history={createMemoryHistory('/')}/>);

    expect($root.find('Rooms').length).equal(0);
    expect($root.find('Login').length).equal(1);
  });

  it('Should not redirect to login', () => {
    const serverStore = mockServerStore();
    const clientStore = mockClientStore().connect(serverStore);
    clientStore.dispatch(loginUserRequest('/test', 'User0', 'testPassword'));

    const $root = mount(<Root store={clientStore} history={createMemoryHistory('/')}/>);
    expect($root.find('Rooms').length).equal(1);
    expect($root.find('Login').length).equal(0);
  });

  //console.log(store.getActions());
  //console.log(store.getState().toJS());

  //console.log('component.find(#Login).props()', component.find('#Login').props());
  //expect(component.find('#Login')).not.undefined;
  //component.setState({open: true});
  //expect(component.hasClass('MyComponent--open')).to.be.true;

  //it('should set state.open = true when clicked', () => {
  //  const component = shallow(<MyComponent store={store}/>);
  //  component.simulate('click')
  //  expect(component.state('open')).to.be.true;
  //});
});