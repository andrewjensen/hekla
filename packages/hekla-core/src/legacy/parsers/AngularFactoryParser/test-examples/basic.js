angular.module('app').factory('animalService', function($http, anotherService) {
  return {
    fetchAnimals: fetchAnimals,
    fetchOneAnimal: fetchOneAnimal
  };

  function fetchAnimals() { }

  function fetchOneAnimal(animalId) { }

});
