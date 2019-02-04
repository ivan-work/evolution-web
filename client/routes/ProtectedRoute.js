import React from "react";
import {branch, compose, renderComponent} from "recompose";
import connect from "react-redux/es/connect/connect";
import {Redirect, Route} from "react-router";

const ProtectedRoute = compose(
  connect(state => ({isAuthenticated: !!state.user}))
  , branch(props => !props.isAuthenticated, renderComponent(() => (<Redirect to={'/login'}/>)))
)(Route);

export default ProtectedRoute;