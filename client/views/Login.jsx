import React from 'react';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {Button, Textfield} from 'react-mdl';

import {loginUserFormRequest, loginUserTokenRequest} from '../../shared/actions/actions';
import Validator from 'validatorjs';
import {RulesLoginPassword} from '../../shared/models/UserModel';

import LocationService from '../services/LocationService';
import VKAPILogin from './auth/VKAPILogin.jsx';

export class Login extends React.PureComponent {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
    this.state = {};
    this.state.form = {};
    this.state.form.login = '';
    this.state.form.password = '';
    this.state.form.redirectTo = LocationService.getLocationQuery().redirect;
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
      <div className="layout-padding flex-row">
        {//!this.props.locationQuery.form ? null :
          <div className="layout-padding">
            <form role='form'>
              <div>
                <Textfield
                  type='text'
                  floatingLabel
                  value={this.state.form.login}
                  onChange={({target}) => this.formOnChange('login', target)}
                  error={this.state.validation.errors.errors.login}
                  autoComplete='off'
                  label={T.translate('App.Login.Username')}
                />
              </div>
              {/*<div>*/}
                {/*<Textfield*/}
                  {/*type='text'*/}
                  {/*floatingLabel*/}
                  {/*value={this.state.form.password}*/}
                  {/*onChange={({target}) => this.formOnChange('password', target)}*/}
                  {/*error={this.state.validation.errors.errors.password}*/}
                  {/*autoComplete='off'*/}
                  {/*label={T.translate('App.Login.Password')}*/}
                {/*/>*/}
              {/*</div>*/}
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
          </div>}
        <div className="layout-padding">
          <VKAPILogin $loginUser={this.props.$loginUser}/>
        </div>
      </div>
    );
  }
}

export const LoginView = connect(
  (state) => ({}),
  (dispatch) => ({
    $loginUser: (...args) => dispatch(loginUserFormRequest(...args))
  })
)(Login);

