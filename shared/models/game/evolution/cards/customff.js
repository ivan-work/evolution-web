import makeCard from './makeCard';
import * as traits from '../traitTypes/index';

// TraitInfected
// TraitPerspicuus
// TraitVomitus
// TraitSkinny
// TraitAmphibious
// TraitAggression
// TraitMutation
// TraitAdaptation
// TraitVoracious
// TraitOviparous
// TraitCannibalism
// TraitParalysis
// TraitPest
// TraitFlea

// Custom FF addon
// Зараженное/Водоплавающее: 2шт
// Зараженное/Хищник: 2шт
// Прозрачное/Паралич: 2шт
// Прозрачное/Агрессия: 2шт
export const CardInfectedAndMutation = makeCard(traits.TraitInfected, traits.TraitMutation);
export const CardInfectedAndCarnivorous = makeCard(traits.TraitInfected, traits.TraitCarnivorous);
export const CardPerspicuusAndParalysis = makeCard(traits.TraitPerspicuus, traits.TraitParalysis);
export const CardPerspicuusAndAggression = makeCard(traits.TraitPerspicuus, traits.TraitAggression);
// Плюющееся/Камуфляж: 2шт
// Плюющееся/Водоплавающее: 2шт
// Тощее/Сотрудничество: 2шт
// Тощее/Хищник: 2шт
export const CardVomitusAndCamouflage = makeCard(traits.TraitVomitus, traits.TraitCamouflage);
export const CardVomitusAndSwimming = makeCard(traits.TraitVomitus, traits.TraitSwimming);
export const CardSkinnyAndCommunication = makeCard(traits.TraitSkinny, traits.TraitCommunication);
export const CardSkinnyAndCarnivorous = makeCard(traits.TraitSkinny, traits.TraitCarnivorous);
// Амфибия/Водоплавающее: 2шт
// Амфибия/Жировой Запас: 2шт
// Некроз/Мутирующее: 2шт
// Приспособленное/Пиратство: 2шт
export const CardAmphibiousAndSwimming = makeCard(traits.TraitAmphibious, traits.TraitSwimming);
export const CardAmphibiousAndFatTissue = makeCard(traits.TraitAmphibious, traits.TraitFatTissue);
export const CardAggressionAndMutation = makeCard(traits.TraitAggression, traits.TraitMutation);
export const CardAdaptationAndPiracy = makeCard(traits.TraitAdaptation, traits.TraitPiracy);
// Яйцекладущее/Взаимодействие: 2шт
// Яйцекладущее/Прожорливое: 2шт
// Каннибализм/ОстроеЗрение: 2шт
// Каннибализм/Большое: 2шт
export const CardOviparousAndCooperation = makeCard(traits.TraitOviparous, traits.TraitCooperation);
export const CardOviparousAndVoracious = makeCard(traits.TraitOviparous, traits.TraitVoracious);
export const CardCannibalismAndSharpVision = makeCard(traits.TraitCannibalism, traits.TraitSharpVision);
export const CardCannibalismAndMassive = makeCard(traits.TraitCannibalism, traits.TraitMassive);
// Вредитель/Взаимодействие: 2шт
// Вредитель/Хищник: 2шт
// Блохи/Сотрудничество: 2шт
export const CardPestAndParalysis = makeCard(traits.TraitPest, traits.TraitParalysis);
export const CardPestAndCarnivorous = makeCard(traits.TraitPest, traits.TraitCarnivorous);
export const CardFleaAndCommunication = makeCard(traits.TraitFlea, traits.TraitCommunication);
