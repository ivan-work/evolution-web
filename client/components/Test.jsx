import React, {Component} from 'react';

import {Dialog} from './../views/utils/Dialog.jsx';
import {GameFoodContainer} from './../views/game/food/GameFoodContainer.jsx';

export class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true
      , food: 244
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
          this.setState({food: this.state.food - 1})
        }
        }/>
      </div>
    </div>
  }
}