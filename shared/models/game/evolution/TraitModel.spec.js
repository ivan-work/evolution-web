import {parseTrait, TraitModel} from './TraitModel';

describe('TraitModel', () => {
  it('parse', () => {
    expect(parseTrait('carn')).equal('TraitCarnivorous');
    expect(parseTrait('sharp')).equal('TraitSharpVision');
    expect(parseTrait('camo')).equal('TraitCamouflage');
  });
});