/**
 * Проверка типов загруженных файлов, приведение типов данных.
 * @author Max Maslenko (lynchnost@gmail.com)
 */

/**
 * @param  {boolean|number|Object} a
 * @param  {boolean|number|Object} b
 * @return {string|number}
 */

function getMessage(a, b) {
  if (typeof a == 'boolean') {
    if (a) {
      return 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
    } else {
      return 'Переданное GIF-изображение не анимировано';
    }
  } else if (typeof a == 'number') {
    return 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + (b * 4) + ' аттрибутов';
  } else if ((typeof a == 'object') && (typeof b == 'object')) {
    //Сначала проверяем, что оба аргумента являются массивами и выполняем этот блок кода раньше
    if ((Array.isArray(a) && Array.isArray(b)) && (a.length == b.length)) {
      for (var square = 0, i = 0; i < a.length; i++) {
        square += (a[i] * b[i]);
      }
      return 'Общая площадь артефактов сжатия: ' + square + ' пикселей';
    }
  } else if (typeof a == 'object') {
    if (Array.isArray(a)) {
      for (var sum = 0, i = 0; i < a.length; i++) {
        sum += a[i];
      }
      return 'Количество красных точек во всех строчках изображения: ' + sum;
    }
  }
  return 'Что-то пошло не так...';
}
