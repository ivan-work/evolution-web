import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

import gecko from '../../../assets/gfx/gecko.svg';

export default class AnimalTraitDetails extends Component {
  static propTypes = {
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const {trait} = this.props;

    const text = T.translate('Game.TraitDesc.' + trait.type)
      .replace(/\$EAT/g, T.translate('Game.TraitDesc.$EAT'))
      .replace(/\$CDRound/g, T.translate('Game.TraitDesc.$CDRound'))
      .replace(/\$CDTurn/g, T.translate('Game.TraitDesc.$CDTurn'))
      .replace(/\$A/g, `<img class='icon' src='${gecko}'/>`)
      .replace(/\$F/g, `<i class='icon material-icons'>spa</i>`)

    const className = classnames({
      AnimalTraitDetails: true
      , [trait.type]: true
      , value: trait.value
    });

    return <div className={className}>
      <div className='Title'>
        {T.translate('Game.Trait.' + trait.type)}&nbsp;{trait.getDataModel().food > 0 && ('+' + trait.getDataModel().food)}
      </div>
      <div className='Text'><span dangerouslySetInnerHTML={{__html: text}}/></div>
    </div>;
  }
}