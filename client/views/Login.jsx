import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import { bindActionCreators } from 'redux';
import {connect} from 'react-redux';
import * as actionCreators from 'actions'
import * as MDL from 'react-mdl';

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
    this.props.actions.loginUserRequest(this.state.username, this.state.password, this.state.redirectTo);
  }
  , render: function () {
    const usernameLink = this.linkState('username');
    var handleChange = (e) => usernameLink.requestChange(e.target.value);

    return (
      <div>
        <h3>Login</h3>
        {this.props.statusText ? <div className='alert alert-info'>{this.props.statusText}</div> : ''}
        <form role='form'>
          <MDL.Textfield
            type='text'
            floatingLabel
            value={usernameLink.value}
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
    isAuthenticating: state.getIn(['auth', 'isAuthenticating'])
    , statusText: state.getIn(['auth', 'statusText'])
  }),
  (dispatch) => ({actions: bindActionCreators(actionCreators, dispatch)})
)(Login);

