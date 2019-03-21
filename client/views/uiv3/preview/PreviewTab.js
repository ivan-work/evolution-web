import React from 'react';
import T from "i18n-react";
import cn from 'classnames';
import {compose, withProps} from "recompose";
import {connect} from "react-redux";

import withStyles from '@material-ui/core/styles/withStyles';

export const styles = theme => ({
  previewTab: {
    minWidth: 100
    , maxWidth: 200
    , height: 60
    , flex: '1 1 0'

    , margin: theme.spacing.unit / 2

    , overflow: 'hidden'
    , outline: '1px dotted #aaa'

    , textDecoration: 'none'
    , color: 'inherit'
    , '&:hover': {
      textDecoration: 'none'
      , color: 'inherit'
    }
  }
});

const PreviewTab = ({classes, className, children, focusId, onClick}) => (
  <a className={cn({
    [classes.previewTab]: true
    , [className]: !!className
  })}
     href={`#${focusId}`}
     onClick={onClick}
    // onMouseEnter={focusControls.onEnter}
    // onMouseLeave={focusControls.onLeave}
    // onMouseDown={focusControls.onDown}
    // onTouchEnd={focusControls.onDown}
  >
    {children}
  </a>
);
export default compose(
  withStyles(styles)
  , withProps(({focusId, focusSelect, focusHover, setHoverFocus, setClickFocus}) => {
    const isHovered = focusId === focusHover;
    const isSelected = focusSelect.has(focusId);
    return {
      // focusControls: {
      //   onEnter: () => setHoverFocus(focusId)
      //   , onLeave: () => setHoverFocus(null)
      //   , onDown: () => setClickFocus(focusId, !isSelected)
      // }
    }
  })
)(PreviewTab);