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
  , login: function (e) {
    e.preventDefault();
    this.props.actions.loginUser(this.state.username, this.state.password, this.state.redirectTo);
  }
  , render: function () {
    return (<div className='col-xs-12 col-md-6 col-md-offset-3'>
      <h3>Log in to view protected content!</h3>
      <p>Hint: hello@test.com / test</p>
      {this.props.statusText ? <div className='alert alert-info'>{this.props.statusText}</div> : ''}
      <form role='form'>
        <div className='form-group'>
          <input type='text'
                 className='form-control input-lg'
                 valueLink={this.linkState('email')}
                 placeholder='Email'/>
        </div>
        <div className='form-group'>
          <input type='password'
                 className='form-control input-lg'
                 valueLink={this.linkState('password')}
                 placeholder='Password'/>
        </div>
        <button type='submit'
                className='btn btn-lg'
                disabled={this.props.isAuthenticating}
                onClick={this.login}>Submit
        </button>
      </form>
    </div>);
  }
});

export const LoginView = connect(
  (state) => ({
    isAuthenticating: state.getIn(['auth', 'isAuthenticating'])
    , statusText: state.getIn(['auth', 'statusText'])
  }),
  (dispatch) => ({actions: bindActionCreators(actionCreators)})
)(Login);

