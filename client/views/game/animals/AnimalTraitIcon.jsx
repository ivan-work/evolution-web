import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import classnames from 'classnames';

import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

import * as MDL from 'react-mdl';

const AnimalTraitIcon = ({trait}) => {
  const className = classnames({
    AnimalTraitIcon: true
    , [trait.type]: true
    , value: trait.value
    , 'mdl-shadow--2dp': true
  });

  return <div className={className}>
    <span>
      {T.translate('Game.Trait.' + trait.type)}&nbsp;{trait.getDataModel().food > 0 && ('+' + trait.getDataModel().food)}
    </span>
  </div>;
};

AnimalTraitIcon.propTypes = {
  trait: PropTypes.instanceOf(TraitModel).isRequired
};

export default AnimalTraitIcon;