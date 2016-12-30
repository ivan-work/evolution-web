import React, {Component} from 'react';
// import {connect} from 'react-redux';
import T from 'i18n-react';
import {Button} from 'react-mdl';

// export const VKAPILogin = ({}) => {
export default () => {
  const VK_API_REQUEST = {
    client_id: process.env.VK_API_ID
    , redirect_uri: window.location.origin + '/api/oauth/vk'
    , display: 'page'
    , response_type: 'code'
    , v: '5.60'
    // , revoke: process.env.NODE_ENV === 'production' ? 0 : 1
    // , state: connectionId
  };

  const VK_API_REQUEST_STRING = 'https://oauth.vk.com/authorize?' + Object.keys(VK_API_REQUEST).map((k) => k + '=' + VK_API_REQUEST[k]).join('&');

  return (
    <div id="VKAPIAuth">
      <Button primary raised href={VK_API_REQUEST_STRING}>{T.translate('App.Login.VK')}</Button>
    </div>
  );
};