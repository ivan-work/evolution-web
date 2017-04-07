import React from 'react';
import T from 'i18n-react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import cn from 'classnames';

import {DragSource} from 'react-dnd';
import {DND_ITEM_TYPE} from './../dnd/DND_ITEM_TYPE';

import {TraitModel} from '../../../../shared/models/game/evolution/TraitModel';
import {TRAIT_COOLDOWN_LINK} from '../../../../shared/models/game/evolution/constants';

import AnimalTraitIcon from './AnimalTraitIcon.jsx';

//class GameTrait extends React.Component {
//  static propTypes = {
//    trait: React.PropTypes.instanceOf(TraitModel).isRequired
//  };
//
//  static defaultProps = {classNames: {}};
//
//  constructor(props) {
//    super(props);
//    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
//  }
//
//  render() {
//    const {trait} = this.props;
//
//    //const className = classnames(Object.assign(this.classNames || {}, {
//    //  AnimalTrait: true
//    //  , [trait.type]: true
//    //  , value: trait.value
//    //}));
//
//    return (<div id={'AnimalTrait' + trait.id} className={className}>
//      <AnimalTraitIcon trait={trait}/>
//    </div>);
//  }
//}

const DragTraitShell = DragSource(DND_ITEM_TYPE.TRAIT_SHELL
  , {
    beginDrag: ({trait}) => ({trait})
    , canDrag: ({trait, game}, monitor) => (
      game.isPlayerTurn()
      && game.isFeeding()
      && !game.cooldowns.checkFor(TRAIT_COOLDOWN_LINK.EATING, game.getPlayer() && game.getPlayer().id)
    )
  }
  , (connect, monitor) => ({
    connectDragSource: connect.dragSource()
    , isDragging: monitor.isDragging()
    , canDrag: monitor.canDrag()
  })
)(class extends React.Component {
  static displayName = 'TraitShell';
  static propTypes = {
    // by parent
    trait: React.PropTypes.instanceOf(TraitModel).isRequired
    // by life
    , game: React.PropTypes.object.isRequired
    // by DnD
    , connectDragSource: React.PropTypes.func.isRequired
    , canDrag: React.PropTypes.bool.isRequired
    , isDragging: React.PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

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