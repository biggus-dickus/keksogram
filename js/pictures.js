'use strict';

(function() {
  var filterForm = document.querySelector('.filters');
  var filters = document.querySelectorAll('.filters-radio');
  var activeFilter = 'filter-popular';
  var container = document.querySelector('.pictures');
  var pictures = [];

  // Прячем блок с фильтрами на время загрузки.
  filterForm.classList.add('hidden');

  // Установка фильтра и сортировка при клике.
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function(evt) {
      var clickedElementID = evt.target.id;
      setActiveFilter(clickedElementID);
    };
  }

  // Грузим картинки по Ajax. Магия хойстинга.
  getPictures();


  // Перебираем элементы в структуре данных, для ускорения отрисовки пользуемся
  // documentFragment.
  function renderPictures(picturesToRender) {
    container.innerHTML = '';
    var fragment = document.createDocumentFragment();

    picturesToRender.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      fragment.appendChild(element);
    });

    container.appendChild(fragment);
  }

  // Функция сортировки.
  function setActiveFilter(id, force) {
    // Предотвращение повторной установки одного и того же фильтра.
    if (activeFilter === id && !force) {
      return;
    }

    // Сортировка элементов массива по выбранному фильтру.
    var filteredPictures = pictures.slice(0);

    switch (id) {
      case ('filter-new'):
        // 3 месяца назад - это ~90 дней, и нафиг календарную точность:)
        var threeMonthsAgo = +Date.now() - 90 * 24 * 60 * 60 * 1000;

        filteredPictures = filteredPictures.filter(function(item) {
          return Date.parse(item.date) > threeMonthsAgo.valueOf();
        }).sort(function(a, b) {
          return Date.parse(b.date) - Date.parse(a.date);
        });
        break;

      case ('filter-discussed'):
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
    }

    renderPictures(filteredPictures);
    activeFilter = id;
  }


  // Функция выгрузки данных по AJAX из pictures.json.
  // Note to self: указывать ссылку надо ОТНОСИТЕЛЬНО INDEX.HTML!!!
  function getPictures() {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 10000;
    xhr.open('GET', 'data/pictures.json');

    // Пока идет загрузка, показываем прелоадер.
    container.classList.add('pictures-loading');

    // Если подключение не произошло, выдаем сообщение об ошибке.
    var showError = function() {
      container.classList.remove('pictures-loading');
      container.classList.add('pictures-failure');
    };

    xhr.ontimeout = showError;

    // Обрабатываем загруженные данные.
    xhr.onload = function(evt) {
      if (evt.target.status >= 200 || evt.target.status < 300) {
        var rawData = evt.target.response;
        var loadedPictures = JSON.parse(rawData);

        container.classList.remove('pictures-loading');
        updateLoadedPictures(loadedPictures);
      } else {
        showError();
        return;
      }
    };

    xhr.send();
  }

  // Сохранение выгруженного списка в pictures согласно выставленному фильтру.
  function updateLoadedPictures(loadedPictures) {
    pictures = loadedPictures;

    setActiveFilter(activeFilter, true);
  }


  // Создание DOM-элемента на основе шаблона.
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

  // Снова показываем блок с фильтрами.
  filterForm.classList.remove('hidden');
})();
