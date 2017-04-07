import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
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
  trait: React.PropTypes.instanceOf(TraitModel).isRequired
};

export default AnimalTraitIcon;