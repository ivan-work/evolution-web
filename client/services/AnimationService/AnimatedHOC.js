import ReactDOM from "react-dom";

import {compose, lifecycle} from "recompose";
import {connect} from "react-redux";
import {animationComponentSubscribe, animationComponentUnsubscribe} from "./animationMiddleware";


export default (getName) => {
  return compose(
    connect(null, {animationComponentSubscribe, animationComponentUnsubscribe})
    , lifecycle({
      componentDidMount() {
        const {animationComponentSubscribe} = this.props;
        this.name = getName(this.props);
        // console.log('ComponentMounted', this.name, ReactDOM.findDOMNode(this));
        this.html = ReactDOM.findDOMNode(this);
        animationComponentSubscribe(this.name, this.html);
      }
      , componentWillUnmount() {
        const {animationComponentUnsubscribe} = this.props;
        animationComponentUnsubscribe(this.name, this.html);
      }
    })
  )
};