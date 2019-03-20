import React from 'react';
import T from "i18n-react";
import cn from 'classnames';
import {compose, withProps} from "recompose";
import {connect} from "react-redux";

import withStyles from '@material-ui/core/styles/withStyles';

export const styles = theme => ({
  previewTab: {
    minWidth: 100
    , maxWidth: 300
    , height: 100
    , flex: '1 1 0'

    , margin: theme.spacing.unit / 2

    , overflow: 'hidden'
    , outline: '1px dotted #aaa'
  }
  , isSelected: {
    outlineColor: 'green'
    , outlineWidth: 3
    , outlineStyle: 'solid'
  }
  , isHovered: {
    outlineColor: 'red'
    , outlineStyle: 'solid'
  }
});

const PreviewTab = ({classes, className, children, isHovered, isSelected, focusControls}) => (
  <div className={cn({
    [classes.previewTab]: true
    , [className]: !!className
    , [classes.isSelected]: isSelected
    , [classes.isHovered]: isHovered
  })}
       onMouseEnter={focusControls.onEnter}
       onMouseLeave={focusControls.onLeave}
       onMouseDown={focusControls.onDown}
       onTouchEnd={focusControls.onDown}
  >
    {children}
  </div>
);
export default compose(
  withStyles(styles)
  , withProps(({isHovered, isSelected, focusData, setHoverFocus, setClickFocus}) => {
    return {
      focusControls: {
        onEnter: () => setHoverFocus(focusData)
        , onLeave: () => setHoverFocus(null)
        , onDown: () => setClickFocus(isSelected ? null : focusData)
      }
    }
  })
)(PreviewTab);