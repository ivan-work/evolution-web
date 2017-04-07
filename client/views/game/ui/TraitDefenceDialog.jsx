import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import {Dialog} from '../../utils/Dialog.jsx';
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
    return (<Dialog show={game.question && game.question.targetPid === game.getPlayer().id}>
      <DialogTitle>Defend!</DialogTitle>
      {game.question ? this.renderDialogContent() : null}
    </Dialog>);
  }

  renderDialogContent() {
    const {game, $traitDefenceAnswer} = this.props;
    const {id, sourceAid, targetAid, time} = game.question;
    const {animal: attackAnimal} = game.locateAnimal(sourceAid);
    const {animal: targetAnimal} = game.locateAnimal(targetAid);
    const targetsMimicry = TraitMimicry.getTargets(game, attackAnimal, TraitCarnivorous, targetAnimal);
    const targetsTailLoss = targetAnimal.traits;
    return (<DialogContent>
      <div className='TraitDefenceDialog'>
        {targetAnimal.hasTrait(TraitTailLoss.type) && targetsTailLoss.size > 0
          ? this.renderTailLoss(targetsTailLoss, $traitDefenceAnswer.bind(null, id, TraitTailLoss.type))
          : null}
        {targetAnimal.hasTrait(TraitMimicry.type) && targetsMimicry.size > 0
          ? this.renderMimicry(targetsMimicry, $traitDefenceAnswer.bind(null, id, TraitMimicry.type))
          : null}
        <h1><T.span text='Game.UI.TraitDefenceDialog.Time'/>: <Timer start={time} end={time + game.settings.timeTraitResponse}/></h1>
      </div>
    </DialogContent>);
  }

  renderMimicry(targets, onClick) {
    return (<div className='Mimicry' style={{minWidth: (80 * targets.size)+'px'}}>
      <h1><T.span text='Game.UI.TraitDefenceDialog.Mimicry.Title'/></h1>
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
      <h1><T.span text='Game.UI.TraitDefenceDialog.TailLoss.Title'/></h1>
      <div>
        {targets.map((trait, index) =>
        <div key={trait.id}
             style={{display: 'inline-block'}}
             onClick={() => onClick(index)}>
          <AnimalTrait trait={trait}/>
        </div>
          )}
      </div>
    </div>);
  }
}