import React, {Component} from 'react';

import {Dialog} from './utils/Dialog.jsx';
import {GameFoodContainer} from './game/food/GameFoodContainer.jsx';

export class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true
      , food: Array.from({length: 37}).map((u, i) => i)
    };
    //setInterval(() => {
    //  //console.log((this.state.food + 1) % 25)
    //  this.setState({food: (this.state.food + 1) % 10})
    //},1000)
  }

  render() {
    return <div>
      <div style={{margin: '200px 200px 0 200px'}}>
        <GameFoodContainer food={this.state.food} onFoodRemoved={(index) => {
          let food = this.state.food;
          food.remove(index);
          this.setState({food})
        }
        }/>
      </div>
    </div>
  }
}