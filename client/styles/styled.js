import React from "react";
import PropTypes from "prop-types";
import cn from "classnames";

import withStyles from "@material-ui/core/styles/withStyles";

export default function styled(Component) {
  return (style, options) => {
    function StyledComponent(props) {
      const {classes, className, ...other} = props;
      return <Component className={cn(classes.root, className)} {...other} />;
    }

    StyledComponent.propTypes = {
      classes: PropTypes.object.isRequired,
      className: PropTypes.string,
    };
    const styles = typeof style === 'function' ? theme => ({root: style(theme)}) : {root: style};
    return withStyles(styles, options)(StyledComponent);
  };
}