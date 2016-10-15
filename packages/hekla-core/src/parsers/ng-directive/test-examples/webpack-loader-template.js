angular.module('app').directive('myPetShop', function() {
  return {
    scope: {
      title: '@',
      dogs: '=',
      cats: '=',
      'quoted': '='
    },
    template: require('text!./basic.html')
  };
});
