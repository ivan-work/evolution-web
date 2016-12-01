import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import T from 'i18n-react';
import {connect} from 'react-redux';
import {loginUserRequest} from '~/shared/actions/actions';
import {Textfield, Button} from 'react-mdl';
import VKAPILogin from './auth/VKAPILogin.jsx';

export class Login extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {
      login: '',
      password: '',
      redirectTo: this.props.location.query.redirect || '/'
    };
  }

  login(e) {
    e.preventDefault();
    this.props.$loginUser(this.state.redirectTo, this.state.login, this.state.password);
  }

  render() {
    return (
      <div>
        <form role='form'>
          <Textfield
            type='text'
            floatingLabel
            value={this.state.login}
            onChange={({currentTarget}) => this.setState({login: currentTarget.value})}
            autoComplete='off'
            label={T.translate('App.Login_Username')}
          />
          <div>
            <Button
              id='Login'
              type='submit'
              raised colored
              disabled={this.props.isAuthenticating}
              onClick={this.login}
            >{T.translate('App.Login_Login')}
            </Button>
          </div>
        </form>
        <VKAPILogin/>
      </div>
    );
  }
}

export const LoginView = connect(
  (state) => ({
  }),
  (dispatch) => ({
    $loginUser: (...args) => dispatch(loginUserRequest(...args))
  })
)(Login);

