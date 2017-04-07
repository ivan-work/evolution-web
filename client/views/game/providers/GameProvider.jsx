import React from 'react';
import {GameModelClient} from '../../../../shared/models/game/GameModel';

export const GameProvider = (DecoratedComponent) => class extends React.Component {
  static contextTypes = {
    game: React.PropTypes.instanceOf(GameModelClient)
  };

  render() {
    const game = this.context.game;
    return <DecoratedComponent {...this.props}
      game={game}
      isUserTurn={game.isUserTurn()}
      isDeploy={game.isDeploy()}
      isFeeding={game.isFeeding()}
    />
  }
};