import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {GameModelClient} from '../../../../shared/models/game/GameModel';

export const GameProvider = (DecoratedComponent) => class extends React.Component {
  static contextTypes = {
    game: React.PropTypes.instanceOf(GameModelClient)
  };

  constructor(props) {
    super(props);
    //todo implement pure with context
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const game = this.context.game;
    return <DecoratedComponent {...this.props}
      game={game}
      isUserTurn={game.isUserTurn()}
      currentUserId={game.getPlayer().id}
      isDeploy={game.isDeploy()}
      isFeeding={game.isFeeding()}
    />
  }
};