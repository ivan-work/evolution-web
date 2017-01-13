import {TraitModel} from './TraitModel';

describe('TraitModel', () => {
  it('parse', () => {
    expect(TraitModel.parse('carn')).equal('TraitCarnivorous');
    expect(TraitModel.parse('sharp')).equal('TraitSharpVision');
    expect(TraitModel.parse('camo')).equal('TraitCamouflage');
  });
});