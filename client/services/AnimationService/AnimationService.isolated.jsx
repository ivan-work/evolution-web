import React from 'react';
import {createStore, applyMiddleware} from 'redux';
import {animationMiddleware, AnimationServiceContext, AnimationServiceRef} from './index';

export const addTodo = (id, text) => ({type: 'ADD', data: {id, text}});
export const removeTodo = (id) => ({type: 'REMOVE', data: id});
const reducer = (state = {}, {type, data}) => {
  switch (type) {
    case 'ADD':
      return Object.assign({}, state, {[data.id]: {id: data.id, text: data.text}});
    case 'REMOVE':
      delete(state[data]);
      return state;
    default:
      return state;
  }
};
export const configureStore = () => createStore(reducer, 0, applyMiddleware(animationMiddleware()));

const TestASRef = AnimationServiceRef(({todo, getRef, connectRef}) => <div
  className='TestASRef'
  ref={c => connectRef('todo#'+todo.id)}>
  {`#${todo.id}:${todo.text}`}
</div>);

export const createTestASContext = (animations) => AnimationServiceContext({animations})(({getState, getRef, connectRef}) => (<div>
  {Object.keys(getState())
    .map(id => <TestASRef key={id} todo={getState()[id]}/>
    )}
</div>));

export class TestAS extends React.Component {
  constructor(props) {
    super(props);
    this._id = 0;
    this.state = {value: 0};
    this.store = configureStore(reducer);
    this.store.subscribe(() => this.forceUpdate());
    this.TestASContext = createTestASContext(({subscribe, getRef}) => {
      subscribe('ADD', (done, props, actionData) => {
        setTimeout(() => {
          done()
        }, 3000)
      });
    });
  }


  onChange(value) {
    this.setState({value});
  }

  onAdd() {
    this.store.dispatch(addTodo(++this._id, this.state.value));
  }

  onRemove() {
    this.store.dispatch(removeTodo(this.state.value));
  }

  render() {
    return <div>
      <input type='text' value={this.state.value} onChange={(e) => this.onChange(e.target.value)}/>
      <button onClick={() => this.onAdd()}>add</button>
      <button onClick={() => this.onRemove()}>remove</button>
      {React.createElement(this.TestASContext, {
        getState: this.store.getState
        })}
    </div>
  }
}