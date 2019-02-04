import React from "react";
import T from "i18n-react";

import {compose, withStateHandlers} from "recompose";
import {connect} from "react-redux";

import Button from "@material-ui/core/Button/Button";
import EvoTextField from "../../components/EvoTextField";

import Validator from "validatorjs";
import {RulesLoginPassword} from "../../../shared/models/UserModel";

import {loginUserFormRequest} from "../../../shared/actions/auth";

export const TextLogin = compose(
  connect(
    (state) => ({}),
    (dispatch) => ({
      $loginUser: (...args) => dispatch(loginUserFormRequest(...args))
    })
  )
  , withStateHandlers(() => {
    return {
      form: {
        login: ''
      }
      , validation: new Validator({}, RulesLoginPassword)
    }
  }, {
    formOnChange: ({form}) => ({target}) => {
      const {name, value} = target;
      form[name] = value;
      const validation = new Validator(form, RulesLoginPassword);
      validation.check();
      return {form, validation};
    }
    , formOnSubmit: ({form}, {$loginUser}) => e => {
      e.preventDefault();
      $loginUser('/', form.login, form.password);
    }
  })
)(
  ({form, validation, formOnChange, formOnSubmit}) => (
    <form noValidate autoComplete={'off'}>
      <EvoTextField
        id="login"
        label={T.translate('App.Login.Username')}
        value={form.login}
        onChange={formOnChange}
        error={validation.errors.errors.login}
      />
      <div>
        <Button
          id='Submit'
          type='submit'
          variant="contained"
          color="primary"
          onClick={formOnSubmit}
        >{T.translate('App.Login.Login')}
        </Button>
      </div>
    </form>));

export default TextLogin;