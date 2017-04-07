import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import T from 'i18n-react';
import {connect} from 'react-redux';

import { loginUserRequest } from '../../shared/actions/actions';
import Validator from 'validatorjs';
import { RulesLoginPassword } from '../../shared/models/UserModel';

import {Button, Textfield} from 'react-mdl';

export class Login extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.login = this.login.bind(this);
    this.state = {};
    this.state.form = {};
    this.state.form.login = '';
    this.state.form.password = '';
    this.state.form.redirectTo = this.props.location.query.redirect;
    this.state.validation = new Validator(this.state.form, RulesLoginPassword);
  }

  login(e) {
    e.preventDefault();
    const {form} = this.state;
    this.props.$loginUser(form.redirectTo, form.login, form.password);
  }

  formOnChange(key, target) {
    const {form} = this.state;
    form[key] = target.value;
    const validation = new Validator(form, RulesLoginPassword);
    validation.passes();
    this.setState({form, validation});
  }

  render() {
    return (
      <div>
        <form role='form'>
          <Textfield
            type='text'
            floatingLabel
            value={this.state.form.login}
            onChange={({target}) => this.formOnChange('login', target)}
            error={this.state.validation.errors.errors.login}
            autoComplete='off'
            label={T.translate('App.Login.Username')}
          />
          <div>
            <Button
              id='Login'
              type='submit'
              raised colored
              onClick={this.login}
            >{T.translate('App.Login.Login')}
            </Button>
          </div>
        </form>
      </div>
    );
  }
}

export const LoginView = connect(
  (state) => ({}),
  (dispatch) => ({$loginUser: (...args) => dispatch(loginUserRequest(...args))})
)(Login);

