var template = [
  '<div class="my-pet-shop">',
    '<my-pet-title></my-pet-title>',
  '</div>',
].join('\n');

angular.module('app').directive('myPetShop', function() {
  return {
    scope: {},
    template: template,
    link: function (scope, el, attrs) {
      console.log('This is my pet shop!');
    }
  };
});
