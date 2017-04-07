import ReactDOM from 'react-dom';
import Velocity from 'velocity-animate'

import {gameGiveCards} from './gameGiveCards';

// [actionName]: (done, componentProps, actionData)
export const createAnimationServiceConfig = () => ({
  animations: ({subscribe, getRef}) => {
    subscribe('gameGiveCards', (done, {game}, {cards}) =>
      gameGiveCards(done, game, cards, getRef));

    subscribe('traitNotifyStart_TraitCarnivorous', (done, {game}, data) => {
      debugger;
      const {sourceAid, targetId} = data;
      const {playerId: sourcePid, animal: sourceAnimal} = game.locateAnimal(sourceAid);
      const {playerId: targetPid, animal: targetAnimal} = game.locateAnimal(targetId);
      const SourceAnimal = getRef('Animal#' + sourceAid);
      const SourceAnimalHtml = ReactDOM.findDOMNode(SourceAnimal);
      const TargetAnimal = getRef('Animal#' + targetId);
      const TargetAnimalHtml = ReactDOM.findDOMNode(TargetAnimal);
      //const TargetPlayerWrapper = getRef('PlayerWrapper#' + targetPid);

      Velocity(SourceAnimalHtml, {
        translateX: 0
        , translateY: -200
      }, 900);

      Velocity(SourceAnimalHtml, {
        translateX: 0
        , translateY: 0
      }, 200);

      setTimeout(() => {
        done();
      }, 2000);
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