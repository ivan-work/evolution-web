import React from "react";
import T from "i18n-react";

import {compose, withStateHandlers} from "recompose";
import {connect} from "react-redux";

import Button from "@material-ui/core/Button";
import EvoTextField from "../../components/EvoTextField";

import withForm from "../../components/withForm";
import {RulesLoginPassword} from "../../../shared/models/UserModel";

import {loginUserFormRequest} from "../../../shared/actions/auth";

export const TextLogin = compose(
  connect(
    null,
    (dispatch) => ({
      $loginUser: (...args) => dispatch(loginUserFormRequest(...args))
    })
  )
  , withForm({
    form: {login: ''}
    , rules: RulesLoginPassword
    , onSubmit: (form, {$loginUser}) => {
      $loginUser('/', form)
    }
  })
)(
  ({form, errors, formOnChange, formOnSubmit}) => (
    <form noValidate autoComplete={'off'}>
      <EvoTextField
        name="login"
        label={T.translate('App.Login.Username')}
        value={form.login}
        onChange={formOnChange}
        error={errors.login}
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