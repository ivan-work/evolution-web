import React from 'react';

import {connect} from 'react-redux';
import {branch, compose, renderNothing} from "recompose";

import Dialog from "./Dialog";

import {MODAL_COMPONENTS_MAP} from "./AppModalComponentMap";
import {closeDialog} from "../../actions/modal";

export const AppModal = ({classes, modal, closeDialog}) => {
  const ModalComponent = MODAL_COMPONENTS_MAP[modal.type];
  return (
    <Dialog
      open={true}
      onClose={closeDialog}>
      <ModalComponent/>
    </Dialog>
  );
};

export default compose(
  connect(({modal}) => ({modal}), {closeDialog})
  , branch(({modal}) => modal.type === null, renderNothing)
)(AppModal)
