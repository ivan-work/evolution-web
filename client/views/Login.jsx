import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import T from 'i18n-react';
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {loginUserRequest} from '~/shared/actions/actions';
import * as MDL from 'react-mdl';
import {VKAPILogin} from './auth/VKAPILogin.jsx';

export const Login = React.createClass({
  mixins: [PureRenderMixin]
  , getInitialState: function () {
    return {
      login: '',
      password: '',
      redirectTo: this.props.location.query.redirect || '/'
    };
  }
  , login: function (e) {
    e.preventDefault();
    this.props.actions.loginUserRequest(this.state.redirectTo, this.state.login, this.state.password);
  }
  , render: function () {
    //console.log('Rendering login', this.props.location)

    return (
      <div>
        <VKAPILogin/>
        {this.props.statusText ? <div className='alert alert-info'>{this.props.statusText}</div> : ''}
        <form role='form'>
          <MDL.Textfield
            type='text'
            floatingLabel
            value={this.state.login}
            onChange={({currentTarget}) => this.setState({login: currentTarget.value})}
            autoComplete='off'
            label={T.translate('App.Login_Username')}
          />
          <div>
            <MDL.Button
              id='Login'
              type='submit'
              raised colored
              disabled={this.props.isAuthenticating}
              onClick={this.login}
            >{T.translate('App.Login_Login')}
            </MDL.Button>
          </div>
        </form>
      </div>
    );
  }
});

export const LoginView = connect(
  (state) => ({
    isAuthenticating: state.getIn(['users', 'isAuthenticating'])
    , statusText: state.getIn(['users', 'statusText'])
  }),
  (dispatch) => ({actions: bindActionCreators({loginUserRequest}, dispatch)})
)(Login);

