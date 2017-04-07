import React, {Component, PropTypes} from 'react';
import T from 'i18n-react'
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {connect} from 'react-redux';

import gecko from '../../../assets/gfx/gecko.svg';

const style = {
  width: '1em'
  , height: '1em'
};

export const AnimalText = ({animal, select}) =>(
  <span>
    <img style={style} className='AnimalText' src={gecko}/>
    {!!animal && <span>
      ({animal.slice(1)
        .map((trait, index) => (
          <span className={index === select ? '' : ''}>
            {T.translate('Game.Trait.' + trait)}
          </span>))
        .map((item, index) => [index > 0 && ', ', item])
      })
    </span>}
  </span>
);

export default AnimalText;
