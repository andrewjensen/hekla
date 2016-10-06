angular.module('app').directive('myPetShop', function() {
  return {
    scope: {},
    templateUrl: '/test-examples/basic.html',
    link: function (scope, el, attrs) {
      console.log('This is my pet shop!');
    }
  };
});
