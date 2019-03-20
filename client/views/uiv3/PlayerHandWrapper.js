import React from 'react';
import {compose, withStateHandlers} from "recompose";
import {connect} from "react-redux";
import withStyles from '@material-ui/core/styles/withStyles';

import Paper from "@material-ui/core/Paper";

import IconArrowUp from '@material-ui/icons/KeyboardArrowUp';
import IconArrowDown from '@material-ui/icons/KeyboardArrowDown';
import IconButton from "@material-ui/core/IconButton/IconButton";
import Fab from "@material-ui/core/Fab";

const styles = {
  handWrapper: {}
  , handWrapperToolbar: {
    textAlign: 'center'
  }
  , handWrapperBody: {}
};

export const PlayerHand = ({classes, children, showHand, toggleHand}) => (
  <div className={classes.handWrapper}>
    <Paper className={classes.handWrapperToolbar}>
      <IconButton onClick={toggleHand}>
        {showHand ? <IconArrowDown/> : <IconArrowUp/>}
      </IconButton>
      {/*<Fab size='small' onClick={toggleHand}>*/}
        {/*{showHand ? <IconArrowDown/> : <IconArrowUp/>}*/}
      {/*</Fab>*/}
    </Paper>
    {showHand && <div className={classes.handWrapperBody}>{children}</div>}
  </div>
);

export default compose(
  withStyles(styles)
  , withStateHandlers({showHand: true}, {
    toggleHand: ({showHand}) => () => ({showHand: !showHand})
  })
)(PlayerHand);