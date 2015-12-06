'use strict';

(function() {
  var filterForm = document.querySelector('.filters');
  var activeFilter = 'filter-popular';
  var container = document.querySelector('.pictures');
  var pictures = [];
  var filteredPictures = [];
  var currentPage = 0;
  var PAGE_SIZE = 12;
  var SCROLL_TIMEOUT = 100;
  var scrollTimeout;

  // Прячем блок с фильтрами на время загрузки.
  filterForm.classList.add('hidden');

  // Установка фильтра и сортировка при клике. Более лучший(-: клик через делегирование.
  // Добавляем также функцию addPageOnScroll, иначе по клику на фильтр
  // на больших разрешениях выводится только 12 фотографий.
  filterForm.addEventListener('click', function(evt) {
    var clickedElement = evt.target;
    if (clickedElement.classList.contains('filters-radio')) {
      setActiveFilter(clickedElement.id);
      addPageOnScroll();
    }
  });

  // Выводим по 12 картинок по скроллу страницы.
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(addPageOnScroll, SCROLL_TIMEOUT);
  });

  // Если 12 картинок помещаются на странице, используем ф-ю addPageOnScroll() еще и на событии 'load'
  // (адаптация для больших разрешений).
  window.addEventListener('load', addPageOnScroll);

  function addPageOnScroll() {
    var bodyCurrentHeight = document.documentElement.offsetHeight;
    var picturesCoordinates = document.querySelector('.pictures').getBoundingClientRect();

    // Т.к. футера в разметке нет, проверяем, превышает ли сумма высоты окна
    // и прокрученных пикселей высоту блока с картинками.
    if (picturesCoordinates.height <= bodyCurrentHeight + window.scrollY) {
      if (currentPage < Math.ceil(filteredPictures.length / PAGE_SIZE)) {
        renderPictures(filteredPictures, ++currentPage);
      }
    }
  }


  // Грузим картинки по Ajax. Магия хойстинга.
  getPictures();


  // Перебираем элементы в структуре данных, для ускорения отрисовки пользуемся
  // documentFragment.
  function renderPictures(picturesToRender, pageNumber, replace) {
    if (replace) {
      container.innerHTML = '';
    }

    var fragment = document.createDocumentFragment();
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var picsOnPage = picturesToRender.slice(from, to);

    picsOnPage.forEach(function(picture) {
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
    filteredPictures = pictures.slice(0);

    switch (id) {
      case ('filter-new'):
        var threeMonthsAgo = new Date();
        // Отнимаем от месяца текущей даты три месяца.
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

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

    // Вывод отфильтрованного массива. Флаг true отвечает за чистку контейнера.
    // (условие для replace в renderPictures();). Обязательно сбрасываем счетчик.
    currentPage = 0;
    renderPictures(filteredPictures, currentPage, true);
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
    xhr.onerror = showError;

    // Обрабатываем загруженные данные.
    xhr.onload = function(evt) {
      if (evt.target.status <= 300) {
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
