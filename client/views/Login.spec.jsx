import React from 'react';
import {Map} from 'immutable';
import {UserModel} from '~/shared/models/UserModel';
import {LoginView} from './Login.jsx';

describe('Client: Login: ', () => {
  it('Should render Login', () => {
    const store = mockClientStore(Map({
      user: Map({
        user: UserModel.new('User0', '1')
      })
    }));

    console.log('store', store.getState().toJS());

    console.log(window.componentHandler)
    //window.componentHandler =

    const component = mount(<LoginView store={store} location={{query: {redirect: '/test'}}}/>);
    console.log('component.find(#Login).props()', component.find('#Login').props());
    expect(component.find('#Login')).not.undefined;
    //component.setState({open: true});
    //expect(component.hasClass('MyComponent--open')).to.be.true;
  });

  //it('should set state.open = true when clicked', () => {
  //  const component = shallow(<MyComponent store={store}/>);
  //  component.simulate('click')
  //  expect(component.state('open')).to.be.true;
  //});
});