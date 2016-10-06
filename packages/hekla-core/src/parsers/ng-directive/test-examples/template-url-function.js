var TemplateUrlModule = require('path/to/TemplateUrlModule');

angular.module('app').directive('myPetShop', function() {
  return {
    scope: {},
    templateUrl: TemplateUrlModule.resolve('myPetShop'),
    link: function (scope, el, attrs) {
      console.log('This is my pet shop!');
    }
  };
});
