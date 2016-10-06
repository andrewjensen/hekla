angular.module('app').directive('myPetShop', function() {
  return {
    scope: {
      title: '@',
      dogs: '=',
      cats: '=',
      'quoted': '='
    },
    template: '<div class="my-pet-shop"><my-pet-title></my-pet-title></div>',
    link: function (scope, el, attrs) {
      console.log('This is my pet shop!');
    }
  };
});
