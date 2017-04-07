import React from 'react';
import {connect} from 'react-redux';
//import {logoutAndRedirect} from 'actions';
import T from 'i18n-react';

import * as MDL from 'react-mdl';
import {Layout, Header, Navigation, Drawer, Content} from 'react-mdl';

import {AdminPanelView} from './AdminPanel.jsx'
import {ServicesContext} from '../services/ServicesContext';
import {PortalsContext, PortalTarget} from '../views/utils/PortalTarget.jsx'
import {TranslationSwitchView} from './TranslationSwitch.jsx'
import ErrorReporter from './ErrorReporter.jsx';

//import '../styles/core.scss';
import {TooltipsContext} from '../views/utils/Tooltips.jsx';


export const App = ServicesContext(PortalsContext(TooltipsContext(React.createClass({
  render: function () {
    const {dispatch} = this.props;
    const {socket} = this.props;
    return (
      <Layout fixedHeader>
        <Header title={`${T.translate('App.Name')} v${GLOBAL_VERSION}`} hideSpacer={true}>
          <Navigation className='header'>
            <TranslationSwitchView/>
            <PortalTarget name='header'/>
          </Navigation>
        </Header>
        <ErrorReporter/>
        <Content>
          {this.props.children}
        </Content>
        {process.env.NODE_ENV === 'development' ? <AdminPanelView location={this.props.location}/> : null}
        <svg width="100%" height="100%"
             style={{position: 'absolute', left: '0', top: '0', zIndex: 100, pointerEvents: 'none'}}>
          <PortalTarget name='game-svg' container='g'/>
        </svg>
        <div width="100%" height="100%"
             style={{position: 'absolute', left: '0', top: '0', zIndex: 100, pointerEvents: 'none'}}>
          <PortalTarget name='tooltips'/>
        </div>
      </Layout>
    );
  }
}))));

export const AppView = connect((state) => {
  return {
    isAuthenticated: state.auth.isAuthenticated
  };
})(App);