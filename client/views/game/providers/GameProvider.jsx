import React from 'react';
import PropTypes from 'prop-types'
import {GameModelClient} from '../../../../shared/models/game/GameModel';

export const GameProvider = (DecoratedComponent) => class GameProvider extends React.Component {
  static contextTypes = {
    game: PropTypes.instanceOf(GameModelClient).isRequired
  };

  static displayName = `GameProvider(${DecoratedComponent.displayName})`;

  render() {
    const game = this.context.game;
    if (!game) {
      console.error(this.constructor.name, 'game is undefined');
      return null;
    }
    return <DecoratedComponent {...this.props}
      game={game}
    />
  }
};