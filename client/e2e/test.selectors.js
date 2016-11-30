export const selectCard = ($client, cardIndex) => $client.find('DragSource(Card)').at(cardIndex);
export const selectUser = ($client, user) => $client.find('.PlayerWrapper').filterWhere(c => c.prop('data-player-id') === (user.id ? user.id : user));
export const selectUserDTAnimal = ($client, user, index) => selectUser($client, user).find('DropTarget(Animal)').at(index);
export const selectDTAnimal = ($client, animalId) => $client.find('DropTarget(Animal)').filterWhere(a => a.prop('model').id === animalId);
export const selectTrait = ($client, animalId, traitIndex) => selectDTAnimal($client, animalId).find('DragSource(AnimalTrait)').at(traitIndex);
export const selectFood = ($client, foodIndex = 0) => $client.find('DragSource(Food)').at(foodIndex);
export const selectHID = ($component) => $component.get(0).getHandlerId();