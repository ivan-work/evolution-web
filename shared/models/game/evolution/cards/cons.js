import makeCard from './makeCard';
import * as traits from '../traitTypes/index';

// Continents

// 0
// стадность / водоплавающее - 2,
// стадность / сотрудничество - 4,
// стадность / хищник - 2,
// миграция / хищник - 4,
export const CardHerdingAndSwimming = makeCard(traits.TraitHerding, traits.TraitSwimming);
export const CardHerdingAndCommunication = makeCard(traits.TraitHerding, traits.TraitCommunication);
export const CardHerdingAndCarnivorous = makeCard(traits.TraitHerding, traits.TraitCarnivorous);
export const CardMigrationAndCarnivorous = makeCard(traits.TraitMigration, traits.TraitCarnivorous);

// 1
// миграция / водоплавающее - 4,
// прилипала / водоплавающее - 2,
// прилипала / сотрудничество - 2,
// регенерация / сотрудничество - 2,

export const CardMigrationAndSwimming = makeCard(traits.TraitMigration, traits.TraitSwimming);
export const CardSuckerfishAndSwimming = makeCard(traits.TraitSuckerfish, traits.TraitSwimming);
export const CardSuckerfishAndCommunication = makeCard(traits.TraitSuckerfish, traits.TraitCommunication);
export const CardRegenerationAndCommunication = makeCard(traits.TraitRegeneration, traits.TraitCommunication);

// 2
// регенерация / водоплавающее - 2,
// регенерация / хищник - 2,
// стрекательные клетки / водоплавающее - 2,
// стрекательные клетки / взаимодействие - 2,

export const CardRegenerationAndSwimming = makeCard(traits.TraitRegeneration, traits.TraitSwimming);
export const CardRegenerationAndCarnivorous = makeCard(traits.TraitRegeneration, traits.TraitCarnivorous);
export const CardCnidocytesAndSwimming = makeCard(traits.TraitCnidocytes, traits.TraitSwimming);
export const CardCnidocytesAndCooperation = makeCard(traits.TraitCnidocytes, traits.TraitCooperation);

// 3
// рекомбинация / хищник - 2,
// рекомбинация / водоплавающее - 2,
// эдификатор / хищник - 2,
// эдификатор / водоплавающее - 2,

export const CardRecombinationAndSwimming = makeCard(traits.TraitRecombination, traits.TraitSwimming);
export const CardRecombinationAndCarnivorous = makeCard(traits.TraitRecombination, traits.TraitCarnivorous);
export const CardAedificatorAndSwimming = makeCard(traits.TraitAedificator, traits.TraitSwimming);
export const CardAedificatorAndCarnivorous = makeCard(traits.TraitAedificator, traits.TraitCarnivorous);

// 4
// неоплазия / водоплавающее - 2,
// неоплазия / взаимодействие - 2.

export const CardNeoplasmAndSwimming = makeCard(traits.TraitNeoplasm, traits.TraitSwimming);
export const CardNeoplasmAndCooperation = makeCard(traits.TraitNeoplasm, traits.TraitCooperation);