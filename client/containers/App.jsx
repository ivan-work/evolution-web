import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {logoutAndRedirect} from '../actions';

//import '../styles/core.scss';

export class App extends React.Component {

  render() {

    const {dispatch} = this.props;

    return (
      <div>
        <nav>
          <div className="nav-wrapper">
            <a href="#" className="brand-logo">Logo</a>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
              <li><a href="sass.html">Sass</a></li>
              <li><a href="badges.html">Components</a></li>
              <li><a href="collapsible.html">JavaScript</a></li>
            </ul>
          </div>
        </nav>
        <nav className="navbar navbar-default">
          <div className="container">
            <div className="navbar-header">
              <Link className="navbar-brand" to="/">React Redux JWT Auth Example</Link>
            </div>
            <div id="navbar">
              <ul className="nav navbar-nav navbar-right">
                <li><Link to="/lobbies">lobbies</Link></li>
                {this.props.isAuthenticated
                  ? <li><a href='#' onClick={() => this.props.dispatch(logoutAndRedirect())}>Logout</a></li>
                  : ''
                  }
              </ul>
            </div>
          </div>
        </nav>
        <div className='container'>
          <div className='row'>
            <div className='col-xs-12'>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>

    );
  }
}

export const AppView = connect((state) => {
  return {
    isAuthenticated: state.auth.isAuthenticated
  };
})(App);