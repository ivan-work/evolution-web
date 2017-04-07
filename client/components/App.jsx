import React from 'react';
import {connect} from 'react-redux';
//import {logoutAndRedirect} from 'actions';

import * as MDL from 'react-mdl';
import {Layout, Header, Navigation, Drawer, Content} from 'react-mdl';

import {AdminPanelView} from './AdminPanel.jsx'
import {PortalsContext, PortalTarget} from '../views/utils/PortalTarget.jsx'

//import '../styles/core.scss';

export const App = PortalsContext(React.createClass({
  render: function () {
    const {dispatch} = this.props;
    const {socket} = this.props;
    return (
      <Layout fixedHeader>
        <svg width="100%" height="100%" style={{position: 'absolute', left: '0', top: '0', zIndex: 100, pointerEvents: 'none'}}>
          <PortalTarget name='game-svg' container='g'/>
        </svg>
        <Header title="Evolution" hideSpacer={true}>
          <Navigation className='header'>
            <PortalTarget name='header'/>
          </Navigation>
        </Header>
        <Content>
          {this.props.children}
        </Content>
        <AdminPanelView location={this.props.location}/>
      </Layout>
    );
  }
}));

export const AppView = connect((state) => {
  return {
    isAuthenticated: state.auth.isAuthenticated
  };
})(App);