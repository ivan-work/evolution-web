import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import * as actionCreators from 'actions'

export const Login = React.createClass({
  mixins: [PureRenderMixin, LinkedStateMixin]
  , getInitialState: function () {
    return {
      username: '',
      password: '',
      redirectTo: this.props.location.query.next || '/'
    };
  }
  , componentDidMount() {
    console.log(this.props)
  }
  , login: function (e) {
    e.preventDefault();
    this.props.actions.loginUser(this.state.username, this.state.password, this.state.redirectTo);
  }
  , render: function () {
    const usernameLink = this.linkState('username');
    var handleChange = (e) => usernameLink.requestChange(e.target.value);

    return (<div className='col-xs-12 col-md-6 col-md-offset-3'>
      <h3>Login</h3>
      {this.props.statusText ? <div className='alert alert-info'>{this.props.statusText}</div> : ''}
      <form role='form'>
        <div className="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
          <input type='text'
                 className='mdl-textfield__input'
                 value={usernameLink.value}
                 onChange={handleChange}/>
          <label className="mdl-textfield__label" forName="sample3">Username</label>
        </div>
        {/*<div className='form-group'>
         <input type='password'
         className='form-control input-lg'
         value={this.linkState('password')}
         placeholder='Password'/>
         </div>*/}
        <div>
          <button type='submit'
                  className='mdl-button mdl-js-button mdl-button--raised mdl-button--colored  mdl-js-ripple-effect"'
                  disabled={this.props.isAuthenticating}
                  onClick={this.login}>
            Login
          </button>
        </div>
      </form>
    </div>);
  }
});

export const LoginView = connect(
  (state) => ({
    isAuthenticating: state.getIn(['auth', 'isAuthenticating'])
    , statusText: state.getIn(['auth', 'statusText'])
  }),
  (dispatch) => ({actions: bindActionCreators(actionCreators, dispatch)})
)(Login);

