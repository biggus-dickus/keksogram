/* global Photo: true, Gallery: true */

/**
 * Модуль выгрузки картинок из data/pictures.json, обработки данных
 * и вывода на страницу с использованием <template>. Фильтрация картинок.
 * Обработчик кликов по фотографиям, показывающий галерею.
 * @author Max Maslenko (lynchnost@gmail.com)
 */

'use strict';

(function() {
  /** @var {HTMLElement} filterForm */
  var filterForm = document.querySelector('.filters');
  /** @var {string} activeFilter */
  var activeFilter = 'filter-popular';
  /** @var {HTMLElement} container */
  var container = document.querySelector('.pictures');
  /** @var {Array.<string>} pictures */
  var pictures = [];
  /** @var {Array.<string>} filteredPictures */
  var filteredPictures = [];
  /** @var {Array.<string>} renderedElements */
  var renderedElements = [];
  /** @var {number} currentPage */
  var currentPage = 0;
  /** @constant {number} PAGE_SIZE */
  var PAGE_SIZE = 12;
  /** @constant {number} SCROLL_TIMEOUT */
  var SCROLL_TIMEOUT = 100;
  /** @var {?number} scrollTimeout */
  var scrollTimeout;
  /** @var {Gallery} gallery */
  var gallery = new Gallery();

  // Прячем блок с фильтрами на время загрузки.
  filterForm.classList.add('hidden');

  /**
   * Установка фильтра и сортировка при клике. Более лучший(-: клик через делегирование.
   * Добавляем также функцию addPageOnScroll, иначе по клику на фильтр
   * на больших разрешениях выводится только 12 фотографий.
   * @param {Event} click
   * @param {Event} evt
   */
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

  /**
   * Перебираем элементы в структуре данных, для ускорения отрисовки пользуемся
   * documentFragment.
   * @param  {Array.<string>} picturesToRender
   * @param  {number} pageNumber
   * @param  {boolean=} replace
   */
  function renderPictures(picturesToRender, pageNumber, replace) {
    if (replace) {
      // Очистка контейнера, если по фильтру кликнули, и, соответственно, replace = true.
      var el;
      while ((el = renderedElements.shift())) {
        container.removeChild(el.element);
        el.onClick = null;
        el.remove();
      }
    }

    var fragment = document.createDocumentFragment();
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var picsOnPage = picturesToRender.slice(from, to);

    // Выгрузка фотографий на страницу теперь осуществляется через объявление экземпляра
    // Photo и вызов у него метода render().
    renderedElements = renderedElements.concat(picsOnPage.map(function(item, i) {
      var pic = new Photo(item);
      pic.render();
      fragment.appendChild(pic.element);

      // Обработчик взаимодействия с фотографией: вызов методов setCurrentPicture и show
      // у объекта Галерея.
      pic.onClick = function() {
        gallery.data = pic._data;
        gallery.setCurrentPicture(i + from); // Без from в галерее будет только 12 фотографий.
        gallery.show();
      };

      return pic;
    }));

    container.appendChild(fragment);
  }

  /**
   * Функция сортировки
   * @param {string} id
   * @param {boolean} force
   */
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

    /**
     * Отфильтрованный массив картинок сперва добавляется в объект Галереи
     * через ее метод setPictures().
     * @param {Array.<Object>} filteredPictures
     */
    gallery.setPictures(filteredPictures);

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

  /**
   * Сохранение выгруженного списка в pictures согласно выставленному фильтру.
   * @param  {Object.<string, string|number>} loadedPictures
   */
  function updateLoadedPictures(loadedPictures) {
    pictures = loadedPictures;

    setActiveFilter(activeFilter, true);
  }

  // Снова показываем блок с фильтрами.
  filterForm.classList.remove('hidden');
})();
