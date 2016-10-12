angular.module('app').directive('myMouseHover', function() {
  'use strict';
  return function myMouseHoverLinkFn(scope, el, attrs) {
    el.on('mouseenter', function(event) {
      console.log('you hovered on me!');
    });
  };
});
