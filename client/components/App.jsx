import React from 'react';
import {connect} from 'react-redux';
//import {logoutAndRedirect} from 'actions';

import {Layout, Header, Navigation, Drawer, Content} from 'react-mdl';

import {AdminPanelView} from './AdminPanel.jsx'

//import '../styles/core.scss';

export const App = React.createClass({
  render: function() {
    const {dispatch} = this.props;
    const {socket} = this.props;
    return (
      <Layout fixedHeader>
        {/*<Header title="Title">
          <Navigation>
            <a href="">Link</a>
            <a href="">Link</a>
            <a href="">Link</a>
            <a href="">Link</a>
          </Navigation>
        </Header>
        <Drawer title="Title">
          <Navigation>
            <a href="">Link</a>
            <a href="">Link</a>
            <a href="">Link</a>
            <a href="">Link</a>
          </Navigation>
        </Drawer>*/}
        <Content>
          <AdminPanelView/>
          <div className="layout-padding">
            {this.props.children}
          </div>
        </Content>
      </Layout>
    );
  }
});

export const AppView = connect((state) => {
  return {
    isAuthenticated: state.auth.isAuthenticated
  };
})(App);