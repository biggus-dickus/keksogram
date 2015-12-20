/**
 * Конструктор и прототипы объекта Фото.
 * @author Max Maslenko (lynchnost@gmail.com)
 */

'use strict';

(function() {
  /**
   * @param {Object} data
   * @constructor
   */
  function Photo(data) {
    this._data = data;

    /**
     * Обработчик клика по картинке.
     * @private
     * @param {Event} evt
     */
    this._onPhotoClick = function(evt) {
      evt.preventDefault();
      if (!this.element.classList.contains('picture-load-failure')) {
        if (typeof this.onClick === 'function') {
          this.onClick();
        }
      }
    }.bind(this);
  }

  // Создание DOM-элемента на основе шаблона из списка pictures.json
  // теперь осуществляется через метод render() у прототипа объекта Photo.
  Photo.prototype.render = function() {
    /** @constant {number} IMAGE_TIMEOUT */
    var IMAGE_TIMEOUT = 10000;
    /** @var {HTMLElement} template */
    var template = document.querySelector('#picture-template');

    // Адаптация функции для IE, где нет поддержки <template>
    if ('content' in template) {
      this.element = template.content.children[0].cloneNode(true);
    } else {
      this.element = template.children[0].cloneNode(true);
    }

    // Вывод количества лайков и комментариев:
    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

    /**
     * Объявляем переменные картинок: первая - заменяемый тэг в шаблоне,
     * вторая - загружаемое с сервера изображение.
     */
    /** @var {HTMLElement} currentImg */
    var currentImg = this.element.querySelector('img');
    /** @var {Image} requestedPic */
    var requestedPic = new Image(182, 182);

    // До загрузки картинки будет отображаться иконка-спиннер.
    this.element.classList.add('picture-load-process');

    var showLoadingError = function() {
      requestedPic.src = '';
      this.element.classList.remove('picture-load-process');
      this.element.classList.add('picture-load-failure');
      this.element.href = '#';
    }.bind(this);

    // Установка таймаута на загрузку изображения.
    var imageLoadTimeout = setTimeout(showLoadingError, IMAGE_TIMEOUT);

    // Отмена таймаута при загрузке и замена картинок.
    requestedPic.onload = function() {
      clearTimeout(imageLoadTimeout);
      this.element.classList.remove('picture-load-process');
      this.element.replaceChild(requestedPic, currentImg);
      this.element.href = requestedPic.src;
    }.bind(this);

    // Обработка ошибки сервера
    requestedPic.onerror = showLoadingError;

    // Изменение src у изображения начинает загрузку.
    requestedPic.src = this._data.url;

    // В загруженные фотографии добавляется обработчик клика.
    this.element.addEventListener('click', this._onPhotoClick);
  };

  /** @type {?Function} */
  Photo.prototype.onClick = null;

  // Удаление обработчика клика по фотографии.
  Photo.prototype.remove = function() {
    this.element.removeEventListener('click', this._onPhotoClick);
  };

  window.Photo = Photo;
})();
