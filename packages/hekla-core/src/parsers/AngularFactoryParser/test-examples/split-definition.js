angular.module('app').factory('animalService', animalService);

function animalService($http, anotherService) {
  return {
    fetchAnimals: fetchAnimals,
    fetchOneAnimal: fetchOneAnimal
  };

  function fetchAnimals() { }

  function fetchOneAnimal(animalId) { }

}
