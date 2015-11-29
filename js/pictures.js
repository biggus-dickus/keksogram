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

    // Установка таймаута на загрузку изображения.
    var imageLoadTimeout = setTimeout(function() {
      requestedPic.src = ''; // Прекращаем загрузку
      element.classList.add('picture-load-failure'); // Показываем ошибку
    }, IMAGE_TIMEOUT);

    requestedPic.onload = function() {
      clearTimeout(imageLoadTimeout);
      element.replaceChild(requestedPic, currentImg);
    };

    // Обработка ошибки сервера
    requestedPic.onerror = function() {
      element.classList.add('picture-load-failure');
    };

    // Изменение src у изображения начинает загрузку.
    requestedPic.src = data.url;
    element.href = requestedPic.src;

    return element;
  }
  // Снова показываем блок с фильтрами
  filters.classList.remove('hidden');
})();
