import {List} from 'immutable/dist/immutable-nonambient';
import React from 'react'
import T from 'i18n-react/dist/i18n-react'

import GameLog from './GameLog.jsx';

describe.only('GameLog', () => {
  it('Transforms Log', () => {
    // console.log(shallow(<span>
    //   {GameLog.LogItemToText(['gameGiveCards', 'User-0', 0])}
    // </span>).text());
    // console.log();
    // console.log(shallow(<span>
    //   {GameLog.LogItemToText(['gameDeployAnimal', 'User-0'])}
    // </span>).text());
    // console.log();
    // console.log(shallow(<span>
    //   {GameLog.LogItemToText(['gameDeployTrait', 'User-0', 'TraitGrazing', ['$Animal', 'TraitCarnivorous']])}
    // </span>).text());
    // console.log();
    console.log(shallow(<span>
      {GameLog.LogItemToText(['gameDeployTrait', 'User-0', 'TraitCooperation', ['$Animal', 'TraitCarnivorous'], ['$Animal', 'TraitCarnivorous']])}
    </span>).text());
    console.log();
    console.log(shallow(<span>
      {GameLog.LogItemToText(['gameEndTurn', 'User-0', true, false])}
    </span>).text());
    console.log();

    console.log(shallow(<span>
      {GameLog.LogItemToText(['traitMoveFood', 1, 'GAME', ['$Animal', 'TraitCarnivorous'], ['$Animal', 'TraitCarnivorous']])}
      {GameLog.LogItemToText(['traitMoveFood', 1, 'GAME', ['$Animal', 'TraitCarnivorous'], ['$Animal', 'TraitCarnivorous']])}
    </span>).text());
    console.log();

    console.log(shallow(<span>
      {GameLog.LogItemToText(['animalDeath', 'KILL', ['$Animal', 'TraitCarnivorous']])}
      {GameLog.LogItemToText(['animalDeath', 'STARVE', ['$Animal', 'TraitCarnivorous']])}
      {GameLog.LogItemToText(['animalDeath', 'POISON', ['$Animal', 'TraitCarnivorous']])}
    </span>).text());
    console.log();
    console.log(shallow(<span>
      {GameLog.LogItemToText(['traitNotify_Start', ['$Animal', 'TraitPoisonous', 'TraitHibernation'], 'TraitHibernation', void 0])}
      {GameLog.LogItemToText(['traitNotify_Start', ['$Animal', 'TraitCarnivorous', 'TraitFatTissue', 'TraitPiracy'], 'TraitPiracy', ['$Animal', 'TraitCarnivorous']])}
    </span>).text());
    console.log();
    console.log(shallow(<span>
      {GameLog.LogItemToText(['traitNotify_Start'
        , ['$Animal', 'TraitTailLoss', 'TraitGrazing', 'TraitCommunication']
        , 'TraitTailLoss'
        , ['$Trait', 0, '$Animal', 'TraitTailLoss', 'TraitGrazing', 'TraitCommunication']
      ])}
    </span>).text());
    console.log();
  });
});