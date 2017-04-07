// Core
import {PropTypes} from 'react';
import RIP from 'react-immutable-proptypes';

// Validation
import {CardModel} from '../../../../shared/models/game/CardModel';

// Components
import {AnimationServiceRef} from '../../../services/AnimationService';
import {Card} from '../Card.jsx';

export const DeckWrapper = AnimationServiceRef(({deck, connectRef}) => (
  <div className='DeckWrapper'>
    <h6>Deck ({deck.size}):</h6>
    <CardCollection
      name="Deck" ref={connectRef('Deck')}
      shift={[2, 1]}>
      {deck.toArray().map((cardModel, i) => <Card card={cardModel} key={i}/>)}
    </CardCollection>
  </div>
));

DeckWrapper.propTypes = {
  deck: RIP.listOf(PropTypes.instanceOf(CardModel)).isRequired
  , connectRef: PropTypes.func.isRequired
};