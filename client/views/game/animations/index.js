import {gameGiveCards} from './gameGiveCards';

// [actionName]: (done, componentProps, actionData)
export const createAnimationServiceConfig = () => ({
  animations: ({getRef}) => ({
    gameGiveCards: (done, {game}, {cards}) => {
      gameGiveCards(done, game, cards, getRef('Deck'), getRef('Cards'));
    }
    , traitNotifyStart_TraitCarnivorous: (done, {game}, {traitTi}) => {
      console.log('traitNotifyStart_TraitCarnivorous')
      //gameGiveCards(done, game, cards, getRef('Deck'), getRef('Cards'));
      setTimeout(() => {
        done();
      }, 0);
    }
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
  })
});