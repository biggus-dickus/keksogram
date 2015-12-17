/**
 * Знакомство с наследованием через пустой объект.
 * @author Max Maslenko (lynchnost@gmail.com)
 */

'use strict';

/**
 * Функция принимает два конструктора и записывает в прототип
 * дочернего конструктора Child методы и свойства родительского
 * конструктора Parent, используя пустой конструктор.
 * @param {Function} Child
 * @param {Function} Parent
 * @return {Object} Child
 */
function inherit(Child, Parent) {
  var EmptyConstructor = function() {};
  EmptyConstructor.prototype = Parent.prototype;
  Child.prototype = new EmptyConstructor();

  return Child;
}

// Вызов функции, спешл фор eslint.
console.log(inherit.toString());
