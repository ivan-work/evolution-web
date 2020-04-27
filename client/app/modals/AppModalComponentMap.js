import {MODAL_TYPES} from './AppModalTypes';
import QuestionMetamorphose from '../../views/game/ui/QuestionMetamorphose';
import QuestionRecombination from '../../views/game/ui/QuestionRecombination';

export const MODAL_COMPONENTS_MAP = {
  [MODAL_TYPES.QUESTION_METAMORPHOSE]: QuestionMetamorphose
  , [MODAL_TYPES.QUESTION_RECOMBINATION]: QuestionRecombination
};