import {MODAL_TYPES} from './AppModalTypes';
import QuestionMetamorphose from '../../views/uiv3/ui/QuestionMetamorphose';
import QuestionRecombination from '../../views/uiv3/ui/QuestionRecombination';

export const MODAL_COMPONENTS_MAP = {
  [MODAL_TYPES.QUESTION_METAMORPHOSE]: QuestionMetamorphose
  , [MODAL_TYPES.QUESTION_RECOMBINATION]: QuestionRecombination
};