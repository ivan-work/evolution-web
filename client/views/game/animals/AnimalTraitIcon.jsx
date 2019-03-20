import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import classnames from 'classnames';
import Button from "@material-ui/core/Button";

import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

const AnimalTraitIcon = ({trait, onClick, disabled}) => {
  const className = classnames({
    AnimalTraitIcon: true
    , [trait.type]: true
    , value: trait.value
  });

  return <Button disabled={disabled} variant={"contained"} className={className} onClick={onClick}>
      {T.translate('Game.Trait.' + trait.type)}&nbsp;{trait.getDataModel().food > 0 && ('+' + trait.getDataModel().food)}
  </Button>;
};

AnimalTraitIcon.propTypes = {
  trait: PropTypes.instanceOf(TraitModel).isRequired
};

export default AnimalTraitIcon;