import React from 'react';
import T from 'i18n-react';
import {Dialog} from '../../utils/Dialog.jsx';
import {DialogTitle, DialogContent} from 'react-mdl';
import {TooltipsContextElement} from '../../utils/Tooltips.jsx';
import AnimalTraitIcon from '../animals/AnimalTraitIcon.jsx';

import {AnimalModel} from '../../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

import './TraitActivateDialog.scss';

export default class TraitActivateDialog extends React.Component {
  static propTypes = {
    question: React.PropTypes.shape({
      animal: React.PropTypes.instanceOf(AnimalModel).isRequired
      , trait: React.PropTypes.instanceOf(TraitModel).isRequired
      , onSelectTrait: React.PropTypes.func.isRequired
    })
  };

  render() {
    const onBackdropClick = !this.props.question ? () => 0
      : () => this.props.question.onSelectTrait(null);
    return (<Dialog show={!!this.props.question} onBackdropClick={onBackdropClick}>
      <DialogTitle>{T.translate('Game.UI.TraitActivateDialog.Title')}</DialogTitle>
      {!!this.props.question && this.renderDialogContent()}
    </Dialog>);
  }

  renderDialogContent() {
    const {animal, trait, onSelectTrait} = this.props.question;
    return (<DialogContent>
      <TooltipsContextElement>
        <div className='TraitActivateDialog'>
          <h1><T.span text='Game.UI.TraitActivateDialog.TailMimicry_Title'/></h1>
          <div className='Row'>
            {trait.getDataModel().getTargets(null, animal, trait).map((trait, index) =>
            <div key={trait.id}
                 className='Item'
                 onClick={() => onSelectTrait(trait.id)}>
              <AnimalTraitIcon trait={trait}/>
            </div>
              )}
          </div>
        </div>
      </TooltipsContextElement>
    </DialogContent>);
  }
}