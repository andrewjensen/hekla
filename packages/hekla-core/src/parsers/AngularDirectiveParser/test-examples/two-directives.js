angular.module('app').directive('myPetMenu', function() {
  return {
    scope: {
      pets: '='
    },
    template: [
      '<div>',
        '<my-pet-menu-item ng-for="pet in pets" name="pet.name"></my-pet-menu-item>',
      '</div>'
    ].join('\n')
  };
});

angular.module('app').directive('myPetMenuItem', function() {
  return {
    scope: {
      name: '@'
    },
    template: '<div>Pet: {{name}}</div>'
  };
});
