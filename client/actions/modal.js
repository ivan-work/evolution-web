import {MODAL_TYPES} from "../app/modals/AppModalTypes";

export const openQuestionMetamorphose = (data) => openDialog(MODAL_TYPES.QUESTION_METAMORPHOSE, data);

export const openQuestionRecombination = (data) => openDialog(MODAL_TYPES.QUESTION_RECOMBINATION, data);

export const openDialog = (type, data) => ({
  type: 'openDialog'
  , data: {type, data}
});

export const closeDialog = () => ({
  type: 'closeDialog'
  , data: null
});

export const showDialog = () => ({
  type: 'showDialog'
});

export const hideDialog = () => ({
  type: 'hideDialog'
});