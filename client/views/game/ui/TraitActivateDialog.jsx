import React from 'react';
import PropTypes from 'prop-types'
import RIP from 'react-immutable-proptypes';
import T from 'i18n-react';
import {Dialog} from '../../utils/Dialog.jsx';
import {DialogTitle, DialogContent, Button} from 'react-mdl';
import AnimalTraitIcon from '../animals/AnimalTraitIcon.jsx';

import {Timer} from '../../utils/Timer.jsx';
import {AnimalModel} from '../../../../shared/models/game/evolution/AnimalModel';
import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

import './TraitActivateDialog.scss';

export default class TraitActivateDialog extends React.Component {
  static propTypes = {
    traits: PropTypes.oneOf([
      RIP.listOf(PropTypes.instanceOf(TraitModel))
      , PropTypes.arrayOf(PropTypes.instanceOf(TraitModel))
    ])
    , allowNothing: PropTypes.bool
    , onSelectTrait: PropTypes.func
  };

  render() {
    const {traits, onSelectTrait} = this.props;
    const onBackdropClick = !onSelectTrait ? () => 0
      : () => onSelectTrait(null);
    return (<Dialog show={!!traits} onBackdropClick={onBackdropClick}>
      <DialogTitle>{T.translate('Game.UI.TraitActivateDialog.Title')}</DialogTitle>
      {!!traits && this.renderDialogContent()}
    </Dialog>);
  }

  renderDialogContent() {
    const {traits, onSelectTrait, allowNothing, game} = this.props;
    return (<DialogContent>
      <div className='TraitActivateDialog'>
        <h1><T.span text='Game.UI.TraitActivateDialog.Title'/></h1>
        <div className='Row'>
          {traits.map((trait, index) =>
            <div key={trait.id}
                 className='Item'
                 onClick={() => onSelectTrait(trait.id)}>
              <AnimalTraitIcon trait={trait}/>
            </div>
          )}
          {allowNothing && <div><Button raised onClick={() => onSelectTrait(true)}>
            {T.translate('Game.UI.TraitActivateDialog.Nothing')}
          </Button></div>}
        </div>
        {game.question && <h1>
          <T.span text='Game.UI.TraitDefenceDialog.Time'/>:&nbsp;
          <Timer start={game.question.time} duration={game.settings.timeTraitResponse}/>
        </h1>}
      </div>
    </DialogContent>);
  }
}