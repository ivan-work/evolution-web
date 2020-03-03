import React from 'react';
import {compose, withStateHandlers} from "recompose";
import withStyles from '@material-ui/core/styles/withStyles';

import Paper from "@material-ui/core/Paper";

import IconArrowUp from '@material-ui/icons/KeyboardArrowUp';
import IconArrowDown from '@material-ui/icons/KeyboardArrowDown';
import {SVGContextSpy} from "./SVGContext";

const styles = {
  handWrapper: {}
  , handWrapperToolbar: {
    textAlign: 'center'
    , '&:hover': {
      cursor: 'pointer'
    }
  }
  , handWrapperBody: {}
};

export const PlayerHand = ({classes, children, showHand, toggleHand}) => (
  <Paper className={classes.handWrapper}>
    <Paper className={classes.handWrapperToolbar} onClick={toggleHand}>
      {showHand ? <IconArrowDown/> : <IconArrowUp/>}
      <SVGContextSpy name='Hand Spy' watch={showHand}/>
    </Paper>
    {showHand && <div className={classes.handWrapperBody}>{children}</div>}
  </Paper>
);

export default compose(
  withStyles(styles)
  , withStateHandlers({showHand: true}, {
    toggleHand: ({showHand}) => () => ({showHand: !showHand})
  })
)(PlayerHand);