import logger from '~/shared/utils/logger';

export default (trait1, trait2) => {
  const type = `Card${trait1}${trait2 ? 'And' + trait2 : ''}`.replace(/(Plant)?Trait/g, '');
  //logger.debug(`${name}`);
  return {
    type
    , trait1: trait1 ? trait1 : null
    , trait2: trait2 ? trait2 : null
  }
};