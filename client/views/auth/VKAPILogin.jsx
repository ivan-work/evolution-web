import React, {Component} from 'react';
import {connect} from 'react-redux';
import T from 'i18n-react';
import {Button} from 'react-mdl';

class VKAPILogin extends Component {
  login() {

  }

  render() {
    const {user} = this.props;
    return <div id="VKAPILogin">
      <Button
        id='VKAPILogin$Login'
        type='submit'
        raised colored
        disabled={this.props.isAuthenticating}
        onClick={this.login}
      >{T.translate('App.Login_VK')}
      </Button>
      {JSON.stringify(user)}
    </div>;
  }
}

const VKAPILoginView = connect(
  (state) => ({
    user: state.get('user')
  }),
  (dispatch) => ({
    // $loginUser: (...args) => dispatch(loginUserRequest(...args))
  })
)(VKAPILogin);

export default VKAPILoginView;