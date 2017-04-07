import React, {Component, PropTypes} from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';

import * as MDL from 'react-mdl';

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
      .replace(/\$A/g, `<img class='icon' src='${gecko}'/>`)
      .replace(/\$F/g, `<i class='icon material-icons'>spa</i>`)
      .replace(/\$EAT/g, T.translate('Game.TraitDesc.$EAT'))
      .replace(/\$CDRound/g, T.translate('Game.TraitDesc.$CDRound'))
      .replace(/\$CDTurn/g, T.translate('Game.TraitDesc.$CDTurn'))
      .replace(/\$Trait\w+/g, x => '"' + T.translate('Game.Trait.' + x.slice(1)) + '"')

    const className = classnames(Object.assign(this.classNames || {}, {
      AnimalTraitDetails: true
      , [trait.type]: true
      , value: trait.value
    }));

    return <MDL.Card className={className} shadow={2}>
      <MDL.CardTitle>{T.translate('Game.Trait.' + trait.type)}&nbsp;{trait.getDataModel().food > 0 && ('+' + trait.getDataModel().food)}</MDL.CardTitle>
      <MDL.CardText><span dangerouslySetInnerHTML={{__html: text}}/></MDL.CardText>
    </MDL.Card>;
  }
}