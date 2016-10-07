import {List, Map} from 'immutable';
import {GameModel} from '../GameModel';
import {AnimalModel} from './AnimalModel';
import {TraitModel} from './TraitModel';
import {STATUS} from '../../UserModel';
import * as cardTypes from './cards';

describe('GameModel.parse', () => {
  it('parseCardList', () => {
    const list = GameModel.parseCardList('  1 carn, 2 sharp  ');
    expect(list.size).equal(3);
    expect(list.first().type).equal(cardTypes.CardCarnivorous.type);
    expect(list.last().type).equal(cardTypes.CardSharpVision.type);

    expect(GameModel.parseCardList(''), 'parseCardList(empty)').equal(List());
  });

  it('parseAnimalList', () => {
    const list = GameModel.parseAnimalList('u', ' carn sharp , sharp camo ');
    expect(list.size).equal(2);
    expect(list.first().traits.size).equal(2);
    expect(list.last().traits.size).equal(2);
    expect(list.first().traits.first().type).equal('TraitCarnivorous');
    expect(list.first().traits.last().type).equal('TraitSharpVision');
    expect(list.last().traits.first().type).equal('TraitSharpVision');
    expect(list.last().traits.last().type).equal('TraitCamouflage');

    expect(GameModel.parseAnimalList('u', ''), 'parseAnimalList(empty)').equal(List());
  });


  it('Valid Seed', () => {
    const parsed = GameModel.parse({id:'r0', users: List(['u0', 'u1'])}
      , `
deck: 12 carnivorous, 6 sharp
phase: 2
food: 2
players:
  - hand: 2 carn
    continent: carn sharp, sharp camo
`);

    const target = GameModel.fromServer({
      roomId: 'r0'
      , deck: GameModel.generateDeck([[12, cardTypes.CardCarnivorous], [6, cardTypes.CardSharpVision]])
      , players: {
        'u0': {
          hand: GameModel.generateDeck([[2, cardTypes.CardCarnivorous]])
          , continent: [
            AnimalModel.new('u0').set('traits', List.of(TraitModel.new('TraitCarnivorous'), TraitModel.new('TraitSharpVision')))
            , AnimalModel.new('u0').set('traits', List.of(TraitModel.new('TraitSharpVision'), TraitModel.new('TraitCamouflage')))
          ]
        }
        , 'u1': {
          hand: []
          , continent: []
        }
      }
      , food: 2
      , started: true
      , status: {
        turn: 0
        , round: 0
        , player: 0
        , phase: 2
      }
    });

    expect(parsed.roomId).equal(target.roomId);
    expect(parsed.food).equal(target.food);
    expect(parsed.started).equal(target.started);
    expect(parsed.status).equal(target.status);
    expect(parsed.deck.size).equal(target.deck.size);
    expect(parsed.deck.first().type).equal(target.deck.first().type);
    expect(parsed.deck.last().type).equal(target.deck.last().type);
    expect(parsed.getIn(['players', 'u0', 'status'])).equal(STATUS.READY);
    expect(parsed.getIn(['players', 'u0', 'hand']).size).equal(target.getIn(['players', 'u0', 'hand']).size);
    expect(parsed.getIn(['players', 'u0', 'hand']).first().type).equal(target.getIn(['players', 'u0', 'hand']).first().type);
    expect(parsed.getIn(['players', 'u0', 'hand']).last().type).equal(target.getIn(['players', 'u0', 'hand']).last().type);

    const parsedContinent = parsed.getIn(['players', 'u0', 'continent']);
    const targetContinent = target.getIn(['players', 'u0', 'continent']);
    expect(parsedContinent.size).equal(targetContinent.size);
    expect(parsedContinent.first().traits.size).equal(targetContinent.first().traits.size);
    expect(parsedContinent.last().traits.size).equal(targetContinent.last().traits.size);
    expect(parsedContinent.first().traits.first().type).equal(targetContinent.first().traits.first().type);
    expect(parsedContinent.first().traits.last().type ).equal(targetContinent.first().traits.last().type );
    expect(parsedContinent.last().traits.first().type ).equal(targetContinent.last().traits.first().type );
    expect(parsedContinent.last().traits.last().type  ).equal(targetContinent.last().traits.last().type  );

    expect(parsed.getIn(['players', 'u1', 'status'])).equal(STATUS.READY);
    expect(parsed.getIn(['players', 'u1', 'hand'])).equal(target.getIn(['players', 'u1', 'hand']));
    expect(parsed.getIn(['players', 'u1', 'continent'])).equal(target.getIn(['players', 'u1', 'continent']));
  });
});