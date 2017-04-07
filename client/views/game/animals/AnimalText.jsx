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

export const AnimalText = ({animal}) =>(
  <span>
    <img style={style} className='AnimalText' src={gecko}/>
    {!!animal && <span>({animal.traits.reverse().map((trait) => T.translate('Game.Trait.'+trait.type)).join(', ')})</span>}
  </span>
);

export const AnimalTextView = connect((store, {id}) => {
  const game = store.get('game');
  const {animal} = game.locateAnimal(id);
  return {animal};
})(AnimalText);

AnimalTextView.propTypes = {id: React.PropTypes.string.isRequired};

export default AnimalTextView;
