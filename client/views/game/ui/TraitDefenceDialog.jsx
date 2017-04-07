import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import {Dialog} from '../../utils/Dialog.jsx';
import {DialogTitle, DialogContent} from 'react-mdl';

import {TooltipsContextElement} from '../../utils/Tooltips.jsx';
import {Timer} from '../../utils/Timer.jsx';
import {Animal} from '../animals/Animal.jsx';
import {AnimalTrait} from '../animals/AnimalTrait.jsx';
import AnimalTraitIcon from '../animals/AnimalTraitIcon.jsx';

import {QuestionRecord} from '../../../../shared/models/game/GameModel.js';
import {TraitCarnivorous, TraitMimicry, TraitTailLoss} from '../../../../shared/models/game/evolution/traitsData/index';
import {TraitInkCloud, TraitShell} from '../../../../shared/models/game/evolution/traitTypes';

import './TraitDefenceDialog.scss';

export class TraitDefenceDialog extends Component {
  static propTypes = {
    $traitAnswer: PropTypes.func.isRequired
  };


  render() {
    const {game} = this.props;
    const show = game.question && game.question.id && game.question.type === QuestionRecord.DEFENSE;
    return (<Dialog show={show}>
      <DialogTitle>{T.translate('Game.UI.TraitDefenceDialog.Title')}</DialogTitle>
      {show && this.renderDialogContent()}
    </Dialog>);
  }

  renderDialogContent() {
    const {game, $traitAnswer} = this.props;
    const {sourceAid, targetAid, time} = game.question;
    const {animal: attackAnimal} = game.locateAnimal(sourceAid);
    const {animal: targetAnimal} = game.locateAnimal(targetAid);

    const traitTailLoss = targetAnimal.hasTrait(TraitTailLoss.type);
    const targetsTailLoss = traitTailLoss && targetAnimal.traits;

    const traitMimicry = targetAnimal.hasTrait(TraitMimicry.type);
    const targetsMimicry = traitMimicry && TraitMimicry.getTargets(game, attackAnimal, TraitCarnivorous, targetAnimal);

    const otherTraits = [
      targetAnimal.hasTrait(TraitShell)
      , targetAnimal.hasTrait(TraitInkCloud)
    ].filter(t => !!t && t.checkAction(game, targetAnimal));
    return (<DialogContent>
      <TooltipsContextElement>
        <div className='TraitDefenceDialog'>
          {traitTailLoss && targetsTailLoss.size > 0
            && this.renderTailLoss(targetsTailLoss, $traitAnswer.bind(null, traitTailLoss.id))
            }
          {traitMimicry && targetsMimicry.size > 0
            && this.renderMimicry(targetsMimicry, $traitAnswer.bind(null, traitMimicry.id))
            }
          {otherTraits.length > 0
            && this.renderOther(otherTraits, $traitAnswer.bind(null))}
          <h1>
            <T.span text='Game.UI.TraitDefenceDialog.Time'/>:
            <Timer start={time} duration={game.settings.timeTraitResponse}/>
          </h1>
        </div>
      </TooltipsContextElement>
    </DialogContent>);
  }

  renderTailLoss(targets, onClick) {
    return (<div className='TailLoss'>
      <h1><T.span text='Game.UI.TraitDefenceDialog.TailLoss_Title'/></h1>
      <div className='Row'>
        {targets.map((trait, index) =>
        <div key={trait.id}
             className='Item'
             onClick={() => onClick(trait.id)}>
          <AnimalTraitIcon trait={trait}/>
        </div>
          )}
      </div>
    </div>);
  }

  renderMimicry(targets, onClick) {
    return (<div className='Mimicry' style={{minWidth: (80 * targets.size)+'px'}}>
      <h1><T.span text='Game.UI.TraitDefenceDialog.Mimicry_Title'/></h1>
      <div className='Row'>
        {targets.map(animal =>
        <div key={animal.id}
             className='Item'
             onClick={() => onClick(animal.id)}>
          <Animal model={animal}/>
        </div>
          )}
      </div>
    </div>);
  }

  renderOther(traits, onClick) {
    return (<div className='Other'>
      <h1><T.span text='Game.UI.TraitDefenceDialog.Other_Title'/></h1>
      <div className='Row'>
        {traits.map((trait, index) =>
        <div key={trait.id}
             className='Item'
             onClick={() => onClick(trait.id)}>
          <AnimalTraitIcon trait={trait}/>
        </div>
          )}
      </div>
    </div>);
  }
}

export default TraitDefenceDialog;