import ReactDOM from 'react-dom';
import Velocity from 'velocity-animate'

import {gameGiveCards} from './gameGiveCards';

import * as localTraits from './traits';

// [actionName]: (done, actionData, getState, componentProps)
export const createAnimationServiceConfig = () => ({
  animations: ({subscribe, getRef}) => {
    if (process.env.NODE_ENV !== 'test' && window.Audio) {
      const audio = new window.Audio(require('../../../assets/sound/notification-02.mp3'));
      subscribe('gameNextPlayerNotify', (done, {userId}, getState) => {
        const sound = getState().getIn(['app', 'sound']);
        if (sound) audio.play();
        done();
      });
    }

    subscribe('gameGiveCards', (done, {cards}, getState) =>
      gameGiveCards(done, getState().get('game'), cards, getRef));

    subscribe('traitNotify_Start', (done, actionData, getState) => {
      const {sourceAid, traitId, traitType, targetId} = actionData;
      if (localTraits[traitType + '_Start']) {
        localTraits[traitType + '_Start'](done, actionData);
      } else {
        localTraits.pingTrait(done, traitId);
      }
    });

    subscribe('traitNotify_End', (done, actionData, getState) => {
      const {sourceAid, traitId, traitType, targetId} = actionData;
      if (localTraits[traitType + '_End']) {
        localTraits[traitType + '_End'](done, actionData);
      } else {
        done();
      }
    });
//, gameNextPlayer: (done, component, {cards}) => {
//  component.setState({
//    toastYourTurn: true
//  });
//  setTimeout(() => {
//    done();
//  }, 5000);
//}
//onlineUpdate: (done, component) => {
//  const {game} = component.props;
//  GameAnimations.gameGiveCards(done, game, game.getPlayer().hand, component.Deck, component.Cards);
//}
//,
  }
});