angular.module('app').component('myPetShop', {
  template: `
    <div class="my-pet-shop">
      <my-pet-title></my-pet-title>
      <div class="title">{{title}}</div>
      <div class="dogs">Dogs: {{dogs}}</div>
      <div class="cats">Cats: {{cats}}</div>
    </div>
  `,
  bindings: {
    title: '<',
    dogs: '<',
    cats: '<',
  },
  controller: PetShopController
});

class PetShopController {
  constructor($element, $rootScope) {}

  $onInit() {}

  $onChanges() {}

  $onDestroy() {}
}
