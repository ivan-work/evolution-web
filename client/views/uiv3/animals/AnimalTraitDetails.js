import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';

import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

import gecko from '../../../assets/gfx/gecko.svg';
import Typography from "@material-ui/core/Typography/Typography";

export default class AnimalTraitDetails extends React.PureComponent {
  static propTypes = {
    trait: PropTypes.instanceOf(TraitModel).isRequired
  };

  render() {
    const {trait} = this.props;

    const text = T.translate('Game.TraitDesc.' + trait.type)
      .replace(/\$Trait\w+/g, x => '"' + T.translate('Game.Trait.' + x.slice(1)) + '"')
      .replace(/\$EAT/g, T.translate('Game.TraitDesc.$EAT'))
      .replace(/\$CDRound/g, T.translate('Game.TraitDesc.$CDRound'))
      .replace(/\$CDTurn/g, T.translate('Game.TraitDesc.$CDTurn'))
      .replace(/\$A/g, `<img class='icon' src='${gecko}'/>`)
      .replace(/\$F/g, `<i class='icon material-icons'>spa</i>`)

    return (
      <div>
        <Typography>
          {T.translate('Game.Trait.' + trait.type)}&nbsp;{trait.getDataModel().food > 0 && ('+' + trait.getDataModel().food)}
        </Typography>
        <Typography dangerouslySetInnerHTML={{__html: text}}/>
      </div>
    );
  }
}