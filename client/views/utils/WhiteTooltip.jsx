import React from 'react'

import withStyles from '@material-ui/core/styles/withStyles';
import Tooltip from '@material-ui/core/Tooltip';

const withWhiteStyles = withStyles(theme => ({
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
}));

export default withWhiteStyles(({classes, ...props}) => {
  return <Tooltip classes={{popper: classes.popper, tooltip: classes.tooltip}} {...props} />
});

// I have no idea why line below doesn't work. If someone find out, please message me
// export default withWhiteStyles(Tooltip);