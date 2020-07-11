import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';

import replace from "react-string-replace";

import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

import Typography from "@material-ui/core/Typography";

import IconAnimal from "../../icons/IconAnimal";
import IconFood from "../../icons/IconFood";

import './TraitDetails.scss';

const VIEW_REGEX = /(\$\w+)/g;

export default class TraitDetails extends React.PureComponent {
  static propTypes = {
    trait: PropTypes.instanceOf(TraitModel).isRequired
  };

  render() {
    const {trait} = this.props;

    const text = replace(
      T.translate('Game.TraitDesc.' + trait.type)
      , VIEW_REGEX
      , (match, index) => {
        if (/\$(Trait\w+)/.test(match)) {
          return `"${T.translate('Game.Trait.' + match.slice(1))}"`
        } else if (/\$EAT/.test(match)) {
          return T.translate('Game.TraitDesc.$EAT')
        } else if (/\$CDRound/.test(match)) {
          return T.translate('Game.TraitDesc.$CDRound')
        } else if (/\$CDTurn/.test(match)) {
          return T.translate('Game.TraitDesc.$CDTurn')
        } else if (/\$TraitCount/.test(match)) {
          return T.translate('Game.TraitDesc.$TraitCount')
        } else if (/\$A/.test(match)) {
          return <IconAnimal key={index} className='icon'/>
        } else if (/\$F/.test(match)) {
          return <IconFood key={index} className='icon'/>
        } else {
          return match;
        }
      }
    );

    return (
      <div className='TraitDetails'>
        <Typography>
          {T.translate('Game.Trait.' + trait.type)}&nbsp;{trait.getDataModel().food > 0 && ('+' + trait.getDataModel().food)}
        </Typography>
        <Typography>
          {text}
        </Typography>
      </div>
    );
  }
}
