import React from 'react';
import PropTypes from 'prop-types'
import T from 'i18n-react';
import cn from 'classnames';

import {DragSource} from 'react-dnd';
import {DND_ITEM_TYPE} from './../dnd/DND_ITEM_TYPE';

import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';
import {TRAIT_COOLDOWN_LINK} from '../../../../shared/models/game/evolution/constants';

import AnimalTraitIcon from './AnimalTraitIcon.jsx';

const DragTraitShell = DragSource(DND_ITEM_TYPE.TRAIT_SHELL
  , {
    beginDrag: ({trait}) => ({trait})
    , canDrag: ({trait, game}, monitor) => (
      game.isPlayerTurn()
      && !game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, game.getPlayer() && game.getPlayer().id)
    )
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(class extends React.PureComponent {
  static displayName = 'TraitShell';
  static propTypes = {
    // by parent
    trait: PropTypes.instanceOf(TraitModel).isRequired
    // by life
    , game: PropTypes.object.isRequired
    // by DnD
    , connectDragSource: PropTypes.func.isRequired
    , canDrag: PropTypes.bool.isRequired
    , isDragging: PropTypes.bool.isRequired
  };

  render() {
    const {trait, connectDragSource, canDrag, isDragging} = this.props;
    const className = cn({
      TraitShell: true
      , draggable: true
      , active: canDrag
      , isDragging
    });
    return connectDragSource(<div className={className}><AnimalTraitIcon trait={trait}/></div>);
  }
});

export default DragTraitShell;