'use strict';

describe('Directive: addfeed', function () {

  // load the directive's module
  beforeEach(module('stupidRssApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<addfeed></addfeed>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the addfeed directive');
  }));
});
