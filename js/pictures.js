/* global pictures: true */
'use strict';

(function() {
  var filters = document.querySelector('.filters');
  var container = document.querySelector('.pictures');

  // Прячем блок с фильтрами
  filters.classList.add('hidden');

  // Перебираем элементы в структуре данных, для ускорения отрисовки пользуемся
  // documentFragment
  pictures.forEach(function(picture) {
    var fragment = document.createDocumentFragment();
    var element = getElementFromTemplate(picture);
    fragment.appendChild(element);
    container.appendChild(fragment);
  });

  // Создание DOM-элемента на основе шаблона
  function getElementFromTemplate(data) {
    var IMAGE_TIMEOUT = 10000;
    var template = document.querySelector('#picture-template');
    var element;

    // Адаптация функции для IE, где нет поддержки <template>
    if ('content' in template) {
      element = template.content.children[0].cloneNode(true);
    } else {
      element = template.children[0].cloneNode(true);
    }

    // Вывод количества лайков и комментариев:
    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    // Объявляем переменные картинок: первая - заменяемый тэг в шаблоне,
    // вторая - загружаемое с сервера изображение.
    var currentImg = element.querySelector('img');
    var requestedPic = new Image(182, 182);

    // До загрузки картинки будет отображаться иконка-спиннер.
    element.classList.add('picture-load-process');

    var showLoadingError = function() {
      requestedPic.src = '';
      element.classList.remove('picture-load-process');
      element.classList.add('picture-load-failure');
      element.href = '#';
    };

    // Установка таймаута на загрузку изображения.
    var imageLoadTimeout = setTimeout(showLoadingError, IMAGE_TIMEOUT);

    // Отмена таймаута при загрузке и замена картинок.
    requestedPic.onload = function() {
      clearTimeout(imageLoadTimeout);
      element.classList.remove('picture-load-process');
      element.replaceChild(requestedPic, currentImg);
      element.href = requestedPic.src;
    };

    // Обработка ошибки сервера
    requestedPic.onerror = showLoadingError;

    // Изменение src у изображения начинает загрузку.
    requestedPic.src = data.url;

    return element;
  }
  // Снова показываем блок с фильтрами
  filters.classList.remove('hidden');
})();
