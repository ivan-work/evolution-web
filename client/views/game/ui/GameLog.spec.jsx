import {List} from 'immutable';
import React from 'react'
import T from 'i18n-react'

import GameLog from './GameLog.jsx';

describe.only('GameLog', () => {
  it('Transforms Log', () => {
    console.log(GameLog.LogItemToText(['gameGiveCards', 'User-0', 0]));
    console.log(GameLog.LogItemToText(['gameDeployAnimal', 'User-0']));
  });
});