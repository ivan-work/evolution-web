import React from 'react'

import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';

export default withStyles(theme => ({
  popper: {
    opacity: 1
  }
  , tooltip: {
    backgroundColor: theme.palette.common.white
    // , width: 500
    , color: theme.palette.text.primary
    , fontSize: 'inherit'
    , zIndex: theme.zIndex.tooltip - 1
    , boxShadow: '1px 1px 5px black'
  }
}))(Tooltip);