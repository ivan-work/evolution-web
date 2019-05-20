import React from 'react';

import {withStyles} from "@material-ui/core";

import MUIDialog from "@material-ui/core/Dialog";

export const styles = theme => ({
  paper: {
    // minWidth: 350,
    maxWidth: '80%',
    // width: '80%'
  }
});

export default withStyles(styles)(MUIDialog);
