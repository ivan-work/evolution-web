import React, {Component} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class Deck extends Component {
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  getXYForCard(index) {
    return {
      x: 1 * index
      , y: 1 * index
    }
  }

  render() {
    return <div className={`Deck`}>
      {React.Children.map(this.props.children, (card, index) => this.renderCardPlace(card, index))}
    </div>;
  }

  renderCardPlace(card, index) {
    const transform = this.getXYForCard(index);
    return <div className="CardPlace" key={index} style={{
        left: transform.x + 'px'
        , top: transform.y + 'px'
          //transform: `translate(${transform.x}px,${transform.y}px)`
        }}>
      {card}
    </div>
  }
}