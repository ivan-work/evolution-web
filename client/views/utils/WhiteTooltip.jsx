import React from 'react'

import Tooltip from '@material-ui/core/Tooltip';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = theme => ({
  popper: {
    opacity: 1
  }
  , tooltip: {
    backgroundColor: theme.palette.common.white
    // , width: 500
    , color: theme.palette.text.primary
    , fontSize: 'inherit'
    , zIndex: theme.zIndex.tooltip - 1
  }
});

export default withStyles(styles)(({classes, children, ...props}) => (
  <Tooltip classes={{tooltip: classes.tooltip, popper: classes.popper}} {...props}>
    {children}
  </Tooltip>
));