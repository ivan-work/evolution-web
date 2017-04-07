// import {Map, List, fromJS} from 'immutable';
// import {UserModel, STATUS} from '../models/UserModel';
// import {RoomModel} from '../models/RoomModel';
//
// import {GameModel, TEST_DECK_SIZE, TEST_HAND_SIZE} from '../models/game/GameModel';
// import {CardModel} from '../models/game/CardModel';
// import * as cardTypes from '../models/game/evolution/cards';
// import {AnimalModel} from '../models/game/evolution/AnimalModel';
// import {PlayerModel} from '../models/game/PlayerModel';
//
// import {
//   SOCKET_DISCONNECT_NOW,
//   roomCreateRequest,
//   roomJoinRequest,
//   gameCreateRequest,
//   gameReadyRequest,
//   gameDeployAnimalRequest,
//   gameDeployTraitRequest,
//   gameEndDeployRequest
// } from '../actions/actions';
//
// describe('Game (EAT PHASE):', function () {
//   it('Simple eating', () => {
//     const [{serverStore, ServerGame, CreateGame}, {clientStore0, User0, ClientGame0}, {clientStore1, User1, ClientGame1}] = mockGame(2);
//     CreateGame({
//       players: {
//         [User0.id]: {
//           continent: [AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))]
//         }, [User1.id]: {
//           continent: [AnimalModel.new(CardModel.new(cardTypes.CardCamouflage))]
//         }
//       },
//     });
//
//     const traitCamouflage = ClientGame0().getPlayerCard(null, 0);
//     const traitSharpVision = ClientGame0().getPlayerCard(null, 1);
//
//     clientStore0.dispatch(
//       gameDeployTraitRequest(traitCamouflage.id
//         , ClientGame0().getPlayerAnimal(null, 0).id
//       ));
//
//     expect(ServerGame().getPlayerAnimal(User0, 0).cards).equal(List.of(traitCamouflage));
//     expect(ClientGame0().getPlayerAnimal(User0, 0).cards).equal(List.of(traitCamouflage));
//     expect(ClientGame1().getPlayerAnimal(User0, 0).cards).equal(List.of(traitCamouflage));
//
//     serverStore.clearActions();
//     clientStore1.clearActions();
//
//     clientStore1.dispatch(gameEndDeployRequest());
//
//     clientStore0.dispatch(
//       gameDeployTraitRequest(traitSharpVision.id
//         , ClientGame0().getPlayerAnimal(null, 0).id
//       ));
//
//     expect(ServerGame().getPlayerAnimal(User0, 0).cards).equal(List.of(traitCamouflage, traitSharpVision));
//     expect(ClientGame0().getPlayerAnimal(User0, 0).cards).equal(List.of(traitCamouflage, traitSharpVision));
//     expect(ClientGame1().getPlayerAnimal(User0, 0).cards).equal(List.of(traitCamouflage, traitSharpVision));
//   });
// });