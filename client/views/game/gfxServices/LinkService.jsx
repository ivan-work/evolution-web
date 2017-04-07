//import React, {Component} from 'react';

const animals = {};

class LinkServiceClass {
  mountAnimal(animalComponent) {
    const animalId = animalComponent.props.animal.id;
    animals[animalId] = animalComponent;
  }

  mountTrait(animalTraitComponent) {
    const trait = animalTraitComponent.props.trait;
    //trait.hostAnimalId;
    //trait.linkAnimalId;
  }


  unmountAnimal(animalComponent) {
    const animalId = animalComponent.props.animal.id;
    //delete animalId
  }
}

export const LinkService = new LinkServiceClass();

//export const LinkServiceHOC = () => (WrappedComponentClass) => class LinkServiceHOC extends Component {
//  constructor(props) {
//    super(props);
//    this.state = {};
//  }
//
//  componentDidMount() {
//    this.displayName = 'ASHOC' + Math.floor(Math.random() * 0xFF);
//    log(`Component ${this.displayName} initialized`);
//    this._isMounted = true;
//    this.animations = animations;
//    Object.keys(animations).forEach((actionType) => {
//      AnimationService.componentSubscribe(this, actionType);
//    });
//  }
//
//  componentDidUpdate() {
//    AnimationService.componentUpdated(this)
//  }
//
//  componentWillUnmount() {
//    this._isMounted = false;
//    AnimationService.componentUnsubscribe(this)
//  }
//
//  getAnimation(actionType) {
//    return this.animations[actionType];
//  }
//
//  render() {
//    return React.createElement(WrappedComponentClass, {
//      ref: (component) => this.wrappedComponent = component
//      , ...this.props
//    });
//  }
//};