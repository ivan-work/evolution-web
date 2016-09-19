import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { AnimalModel } from '~/shared/models/game/evolution/AnimalModel';

export const ANIMAL_SIZE = {
  width: 60
  , height: 80
};

export class Animal extends React.Component {
  static propTypes = {
    model: React.PropTypes.instanceOf(AnimalModel).isRequired
    , index: React.PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const model = this.props.model || {name: 'unknown animal'};
    return <div className='Animal' style={ANIMAL_SIZE}>
      <div className='inner'>
        {this.props.index}
        <br/>{model && model.card && model.card.name}
      </div>
    </div>;
  }
}

export const UnknownAnimal = (props) => <div className='Card' style={ANIMAL_SIZE}>
  <div className='inner'>
    {props.index}
    <br/>Unknown Animal
  </div>
</div>;