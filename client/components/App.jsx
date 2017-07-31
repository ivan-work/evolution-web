import React from 'react';
import {connect} from 'react-redux';
//import {logoutAndRedirect} from 'actions';
import T from 'i18n-react';

import {Layout, Header, Navigation, Content, IconButton, Button, Spacer} from 'react-mdl';

import {AdminPanelView} from './AdminPanel.jsx'
import {ServicesContext} from '../services/ServicesContext';
import {PortalsContext, PortalTarget} from '../views/utils/PortalTarget.jsx'
import {TranslationSwitchView} from './TranslationSwitch.jsx'
import ErrorReporter from './ErrorReporter.jsx';

import {appChangeSound} from '../actions/app';

export const App = ServicesContext(PortalsContext(
  ({children, location, sound, appChangeSound}) => (<Layout fixedHeader>
    <Header title={`${T.translate('App.Name')} v${GLOBAL_VERSION}`} hideSpacer={true}>
      <Navigation className='header'>
        <TranslationSwitchView/>
        <IconButton name={sound ? 'volume_up' : 'volume_off'} onClick={() => appChangeSound(!sound)}/>
        <PortalTarget name='header'/>
        <Spacer/>
        <span>
        <Button target="blank" href={T.translate('App.Misc.FAQ_HREF')}>
          {T.translate('App.Misc.FAQ')}
        </Button>
        <Button target="blank" raised accent href="https://vk.com/evolveonline">
          {T.translate('App.Misc.VKGroup')}
        </Button>
        <Button target="blank" href="https://github.com/ivan-work/evolution-web/blob/master/changelog.md">
          {T.translate('App.Misc.Changelog')}
        </Button>
        </span>
      </Navigation>
    </Header>
    <ErrorReporter/>
    <AdminPanelView location={location}/>
    <Content>
      {children}
    </Content>
    <svg width="100%" height="100%"
         style={{position: 'absolute', left: '0', top: '0', zIndex: 100, pointerEvents: 'none'}}>
      <PortalTarget name='game-svg' container='g'/>
    </svg>
    <div width="100%" height="100%"
         style={{position: 'absolute', left: '0', top: '0', zIndex: 100, pointerEvents: 'none'}}>
      <PortalTarget name='tooltips'/>
    </div>
  </Layout>)
));

export const AppView = connect(
  (state) => ({
    sound: state.getIn(['app', 'sound'])
  })
  , (dispatch) => ({
    appChangeSound: (value) => dispatch(appChangeSound(value))
  })
)(App);

export default AppView;