'use strict';

var petShopDirective = ['$timeout', '$document', function($timeout, $document) {
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
}];

angular.module('app').directive('myPetShop', petShopDirective);
