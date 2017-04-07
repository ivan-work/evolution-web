import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import {loginUserRequest} from '~/shared/actions/actions';
import * as MDL from 'react-mdl';

export const Login = React.createClass({
  mixins: [PureRenderMixin, LinkedStateMixin]
  , getInitialState: function () {
    return {
      login: '',
      password: '',
      redirectTo: this.props.location.query.redirect || '/'
    };
  }
  , componentDidMount() {
    console.log(this.props)
  }
  , login: function (e) {
    e.preventDefault();
    this.props.actions.loginUserRequest(this.state.redirectTo, this.state.login, this.state.password);
  }
  , render: function () {
    const loginLink = this.linkState('login');
    var handleChange = (e) => loginLink.requestChange(e.target.value);

    return (
      <div>
        <h3>Login</h3>
        {this.props.statusText ? <div className='alert alert-info'>{this.props.statusText}</div> : ''}
        <form role='form'>
          <MDL.Textfield
            type='text'
            floatingLabel
            value={loginLink.value}
            onChange={handleChange}
            label='Username'
          />
          {/*<div className='form-group'>
           <input type='password'
           className='form-control input-lg'
           value={this.linkState('password')}
           placeholder='Password'/>
           </div>*/}
          <div>
            <MDL.Button
              type='submit'
              raised colored
              disabled={this.props.isAuthenticating}
              onClick={this.login}
            >Button
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

