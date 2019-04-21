import React from 'react';

import {connect} from 'react-redux';
import {branch, compose, renderNothing} from "recompose";
import {withStyles} from "@material-ui/core";

import Dialog from "@material-ui/core/Dialog";

import {MODAL_COMPONENTS_MAP} from "./AppModalTypes";
import {closeDialog} from "../../actions/modal";

const styles = theme => ({
  dialogPaper: {
    // minWidth: 350,
    // maxWidth: '100%',
    // width: '80%'
  }
});

const AppModal = ({classes, modal, closeDialog}) => {
  const ModalComponent = MODAL_COMPONENTS_MAP[modal.type];
  return (
    <Dialog
      open={true}
      onClose={closeDialog}
      classes={{paper: classes.dialogPaper}}
    >
      <ModalComponent {...modal.data}/>
    </Dialog>
  );
};

export default compose(
  withStyles(styles),
  connect(({modal}) => ({modal}), {closeDialog}),
  branch(({modal}) => modal.type === null, renderNothing)
)(AppModal)
