import {TraitModel} from './TraitModel';

describe('TraitModel', () => {
  it('parse', () => {
    expect(TraitModel.parse('carn').type).equal('TraitCarnivorous');
    expect(TraitModel.parse('sharp').type).equal('TraitSharpVision');
    expect(TraitModel.parse('camo').type).equal('TraitCamouflage');
  });
});