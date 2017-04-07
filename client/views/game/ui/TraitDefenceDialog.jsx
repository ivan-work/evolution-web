import React, {Component, PropTypes} from 'react';
import {Dialog} from '../../utils/Dialog.jsx';
import {DialogTitle, DialogContent} from 'react-mdl';
import {Animal} from '../animals/Animal.jsx';
import {TraitCarnivorous, TraitMimicry} from '../../../../shared/models/game/evolution/traitData';

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
    const {id, sourceAid, targetAid} = game.question;
    const {animal: sourceAnimal} = game.locateAnimal(sourceAid);
    return (<DialogContent>
      {this.renderMimicry(game, sourceAnimal, targetAid, $traitDefenceAnswer.bind(null, id, TraitMimicry.type))}
    </DialogContent>);
  }

  renderMimicry(game, sourceAnimal, targetAid, onClick) {
    const targets = game.getPlayer().continent.filter((animal) =>
      targetAid !== animal.id
      && TraitCarnivorous.checkTarget(game, sourceAnimal, animal)
    );
    return (<div style={{minWidth: (80 * targets.size)+'px'}}>
      <h1>Mimicry to:</h1>
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

  renderTailLoss() {

  }
}