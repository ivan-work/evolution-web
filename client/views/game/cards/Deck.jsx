import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import RIP from 'react-immutable-proptypes';

// Validation
import {CardModel} from '../../../../shared/models/game/CardModel';

import {AnimationServiceRef} from '../../../services/AnimationService';
import {Card} from './Card.jsx';

import './Deck.scss';

export class Deck extends React.Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  getXYForCard(index) {
    return {
      x: .25 * index
      , y: .1 * index
    }
  }

  render() {
    return <div className='Deck'>
      {React.Children.map(this.props.children, (card, index) => this.renderCardPlace(card, index))}
    </div>;
  }

  renderCardPlace(card, index) {
    const transform = this.getXYForCard(index);
    return <div className="CardPlace" key={index} style={{
        left: transform.x + 'px'
        , top: transform.y + 'px'
        , position: 0 === index ? 'relative' : 'absolute'
          //transform: `translate(${transform.x}px,${transform.y}px)`
        }}>
      {card}
    </div>
  }
}

export const DeckWrapper = AnimationServiceRef(({deck, connectRef}) => (
  <Deck ref={connectRef('Deck')}>
    {deck.map((cardModel, i) => <Card key={i} card={cardModel}/>)}
  </Deck>
));

DeckWrapper.propTypes = {
  deck: RIP.listOf(React.PropTypes.instanceOf(CardModel)).isRequired
  //, connectRef: PropTypes.func.isRequired
};

export default DeckWrapper;