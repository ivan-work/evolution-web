import React from 'react';
import {GameModelClient} from '../../../shared/models/game/GameModel';

export const GameProvider = (DecoratedComponent) => class extends React.Component {
  static contextTypes = {
    game: React.PropTypes.instanceOf(GameModelClient)
  };

  render() {
    return <DecoratedComponent {...this.props} game={this.context.game}/>
  }
};