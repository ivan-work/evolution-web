import {gameGiveCards} from './gameGiveCards';

// [actionName]: (done, componentProps, actionData)
export const createAnimationServiceConfig = () => ({
  animations: ({subscribe, getRef}) => {
    subscribe('gameGiveCards', (done, {game}, {cards}) =>
      gameGiveCards(done, game, cards, getRef('Deck'), getRef('Cards')));

    subscribe('traitNotifyStart_TraitCarnivorous', (done, {game}, {}) => {
      console.log('traitNotifyStart_TraitCarnivorous');
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