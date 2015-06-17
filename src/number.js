'use strict'

import {card} from 'creditcards'
export default factory

factory.$inject = ['$parse']
function factory ($parse) {
  return {
    restrict: 'A',
    require: ['ngModel', 'ccNumber'],
    controller: function () {
      this.type = null
      this.eagerType = null
    },
    compile: function ($element, $attributes) {
      $attributes.$set('pattern', '[0-9]*')
      $attributes.$set('xAutocompletetype', 'cc-number')

      return function ($scope, $element, $attributes, [ngModel, ccNumber]) {
        $scope.$watch($attributes.ngModel, (number) => {
          ngModel.$ccType = ccNumber.type = card.type(number)
        })
        function $viewValue () {
          return ngModel.$viewValue
        }
        if (typeof $attributes.ccEagerType !== 'undefined') {
          $scope.$watch($viewValue, function eagerTypeCheck (number) {
            if (!number) return
            number = card.parse(number)
            ngModel.$ccEagerType = ccNumber.eagerType = card.type(number, true)
          })
        }
        if ($attributes.ccType) {
          $scope.$watch($attributes.ccType, function () {
            ngModel.$validate()
          })
        }
        if (typeof $attributes.ccFormat !== 'undefined') {
          $scope.$watch($viewValue, function formatInput (input, previous) {
            if (!input) return
            const formatted = card.format(card.parse(input.replace(/\s/g, '')))
            ngModel.$setViewValue(formatted)
            ngModel.$render()
            const val = $element.val()
            $element.val('')
            $element.val(val)
          })
        }
        ngModel.$parsers.unshift(card.parse)
        ngModel.$validators.ccNumber = (number) => {
          return card.isValid(number)
        }
        ngModel.$validators.ccNumberType = function (number) {
          return card.isValid(number, $parse($attributes.ccType)($scope))
        }
      }
    }
  }
}
