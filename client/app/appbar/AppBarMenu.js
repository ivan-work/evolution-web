import React from "react";
import {compose, withStateHandlers} from "recompose";

import Button from "@material-ui/core/Button";
import Popover from "@material-ui/core/Popover";
import withStyles from "@material-ui/core/styles/withStyles";

const StyledPopover = withStyles({
  paper: {
    maxWidth: '80%'
    , maxHeight: '80%'
    , padding: 8
  }
})(Popover);

export default compose(
  withStateHandlers({anchorEl: null}
    , {
      openMenu: () => (e) => ({anchorEl: e.target})
      , closeMenu: () => () => ({anchorEl: null})
    })
)(({
     anchorEl, openMenu, closeMenu, children
     , text, color = 'primary', variant = 'contained'
   }) => (
  <>
    <Button color={color}
            variant={variant}
            disabled={!children}
            onClick={openMenu}>
      {text}
    </Button>
    <StyledPopover open={Boolean(anchorEl && children)}
                   anchorEl={anchorEl}
                   onClose={closeMenu}
                   anchorOrigin={{
                     vertical: 'bottom',
                     horizontal: 'center',
                   }}
                   transformOrigin={{
                     vertical: 'top',
                     horizontal: 'center',
                   }}>
      {children}
    </StyledPopover>
  </>
));