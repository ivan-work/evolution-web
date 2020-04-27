import React from 'react';
import T from 'i18n-react/dist/i18n-react'
import cn from 'classnames';

import {connect} from 'react-redux';

import gecko from '../../../assets/gfx/gecko.svg';

import './AnimalText.scss';
import IconAnimal from "../../icons/IconAnimal";

export const AnimalText = ({animal, select}) => (
  <span>
    {/*<IconAnimal className='AnimalText'/>*/}
    <img className='AnimalText' src={gecko} alt={T.translate('Game.Animal')} width='1em'/>
    {!!animal && (
      <span>
        ({animal.slice(1)
          .map((trait, index) => (
            <span key={index} className={index === select ? '' : ''}>
                  {T.translate('Game.Trait.' + trait)}
                </span>
          ))
          .map((item, index) => [index > 0 && ', ', item])
        })
      </span>
    )}
  </span>
);

export default AnimalText;
