import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import {Dialog} from '../../utils/Dialog.jsx';
import {TooltipsContextElement} from '../../utils/Tooltips.jsx';
import {Timer} from '../../utils/Timer.jsx';
import {DialogTitle, DialogContent} from 'react-mdl';
import {Animal} from '../animals/Animal.jsx';
import {AnimalTrait} from '../animals/AnimalTrait.jsx';
import {TraitCarnivorous, TraitMimicry, TraitTailLoss} from '../../../../shared/models/game/evolution/traitsData/index';
import './TraitDefenceDialog.scss';

export class TraitDefenceDialog extends Component {
  static propTypes = {
    $traitDefenceAnswer: PropTypes.func.isRequired
  };


  render() {
    const {game} = this.props;
    return (<Dialog show={game.question && game.question.targetPid === game.userId}>
      <DialogTitle>{T.translate('Game.UI.TraitDefenceDialog.Title')}</DialogTitle>
      {game.question ? this.renderDialogContent() : null}
    </Dialog>);
  }

  renderDialogContent() {
    const {game, $traitDefenceAnswer} = this.props;
    const {sourceAid, targetAid, time} = game.question;
    const {animal: attackAnimal} = game.locateAnimal(sourceAid);
    const {animal: targetAnimal} = game.locateAnimal(targetAid);
    const targetsMimicry = TraitMimicry.getTargets(game, attackAnimal, TraitCarnivorous, targetAnimal);
    const targetsTailLoss = targetAnimal.traits;

    const traitTailLoss = targetAnimal.hasTrait(TraitTailLoss.type);
    const traitMimicry = targetAnimal.hasTrait(TraitMimicry.type);
    return (<DialogContent>
      <TooltipsContextElement>
        <div className='TraitDefenceDialog'>
          {traitTailLoss && targetsTailLoss.size > 0
            && this.renderTailLoss(targetsTailLoss, $traitDefenceAnswer.bind(null, traitTailLoss.id))
          }
          {traitMimicry && targetsMimicry.size > 0
            && this.renderMimicry(targetsMimicry, $traitDefenceAnswer.bind(null, traitMimicry.id))
          }
          <h1>
            <T.span text='Game.UI.TraitDefenceDialog.Time'/>:
            <Timer start={time} duration={game.settings.timeTraitResponse}/>
          </h1>
        </div>
      </TooltipsContextElement>
    </DialogContent>);
  }

  renderMimicry(targets, onClick) {
    return (<div className='Mimicry' style={{minWidth: (80 * targets.size)+'px'}}>
      <h1><T.span text='Game.UI.TraitDefenceDialog.Mimicry_Title'/></h1>
      <div>
        {targets.map(animal =>
        <div key={animal.id}
             style={{display: 'inline-block'}}
             onClick={() => onClick(animal.id)}>
          <Animal model={animal}/>
        </div>
          )}
      </div>
    </div>);
  }

  renderTailLoss(targets, onClick) {
    return (<div className='TailLoss' style={{minWidth: (80 * targets.size)+'px'}}>
      <h1><T.span text='Game.UI.TraitDefenceDialog.TailLoss_Title'/></h1>
      <div>
        {targets.map((trait, index) =>
        <div key={trait.id}
             style={{display: 'inline-block'}}
             onClick={() => onClick(trait.id)}>
          <AnimalTrait trait={trait}/>
        </div>
          )}
      </div>
    </div>);
  }
}

export default TraitDefenceDialog;