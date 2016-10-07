import {TraitModel} from './TraitModel';

describe('TraitModel', () => {
  it('parse', () => {
    expect(TraitModel.parse('carn')).equal(TraitModel.new('TraitCarnivorous'));
    expect(TraitModel.parse('sharp')).equal(TraitModel.new('TraitSharpVision'));
    expect(TraitModel.parse('camo')).equal(TraitModel.new('TraitCamouflage'));
  });
});