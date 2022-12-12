import logger from '../../../shared/utils/logger';

import * as tt from '../../models/game/evolution/traitTypes';
import * as ptt from '../../models/game/evolution/plantarium/plantTraitTypes';
import {makeGameSelectors} from '../../selectors'
import {gameEndTurnRequest} from "../game";
import {
  roomCreateRequest,
  roomEditSettingsRequest,
  roomJoinRequest,
  roomStartVoteActionRequest,
  roomStartVotingRequest
} from "../rooms";
import {PHASE} from "../../models/game/GameModel";

describe('[PLANTARIUM] Deck changes:', function () {
  it('Deck changed', () => {
    const [serverStore, {clientStore0}, {clientStore1}] = mockStores(2);
    clientStore0.dispatch(roomCreateRequest());
    const roomId = serverStore.getState().get('rooms').first().id;
    clientStore1.dispatch(roomJoinRequest(roomId));
    clientStore0.dispatch(roomEditSettingsRequest({
      name: 'Room Test'
      , timeTurn: 60
      , timeTraitResponse: 60
      , maxPlayers: 2
      , addon_plantarium: true
      , addon_timeToFly: true
    }));

    expect(serverStore.getState().getIn(['rooms', roomId, 'settings', 'addon_plantarium']), true);
    expect(serverStore.getState().getIn(['rooms', roomId, 'settings', 'addon_timeToFly']), true);

    clientStore0.dispatch(roomStartVotingRequest());
    clientStore1.dispatch(roomStartVoteActionRequest(true));

    const gameId = serverStore.getState().get('games').first().id;

    expect(gameId, 'gameId is OK').ok;
    const {selectGame} = makeGameSelectors(serverStore.getState, gameId);
    expect(selectGame().status.phase).equal(PHASE.DEPLOY);
  });
});
















