//import {Map} from 'immutable';
//import {AnimalModel} from './AnimalModel';
//import {TraitModel} from './TraitModel';
//import {TraitFatTissue} from './traitTypes';
//
//describe('AnimalModel', () => {
//  it('Food', () => {
//    const animalMap = Map({animal: AnimalModel.new('user')})
//      .update('animal', animal =>
//        animal.traitAdd(TraitModel.new(TraitFatTissue)
//          .set('value', true)));
//
//    console.log(animalMap.getIn(['animal']).fat)
//    console.log(animalMap.getIn(['animal', 'fat']))
//  });
//});