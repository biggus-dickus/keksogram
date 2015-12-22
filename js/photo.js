/**
 * Конcтруктор и прототипы объекта Фото. Работает с данными из pictures.json.
 *
 * @author Max Maslenko (lynchnost@gmail.com)
 */
'use strict';

(function() {
  /**
   * @constructor Photo
   *
   * @param {Object} data
   */
  function Photo(data) {
    this._data = data;

    // Адаптация функции для IE, где нет поддержки <template>
    if ('content' in this.template) {
      this.element = this.template.content.children[0].cloneNode(true);
    } else {
      this.element = this.template.children[0].cloneNode(true);
    }

    // Привязка методов к контексту объекта в конструкторе.
    this._onPhotoLoad = this._onPhotoLoad.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onPhotoError = this._onPhotoError.bind(this);
  }

  /**
   * @const
   * @member {number} IMAGE_TIMEOUT
   */
  Photo.prototype.IMAGE_TIMEOUT = 10000;
  Photo.prototype.imageLoadTimeout = 0;

  /**
   * @private
   * @member {?Object} _data
   */
  Photo.prototype._data = null;

  /**
   * @member {?HTMLElement} element
   * @member {?HTMLElement} currentImg
   * @member {?Image} requestedPic
   */
  Photo.prototype.element = null;
  Photo.prototype.currentImg = null;
  Photo.prototype.requestedPic = null;

  /** @member {HTMLElement} template */
  Photo.prototype.template = document.querySelector('#picture-template');

  /**
   * Обработчик клика по картинке.
   *
   * @private
   * @method _onPhotoClick
   *
   * @param {Event} evt
   */
  Photo.prototype._onPhotoClick = function(evt) {
    evt.preventDefault();
    if (!this.element.classList.contains('picture-load-failure')) {
      if (typeof this.onClick === 'function') {
        this.onClick();
      }
    }
  };

  /**
   * Обработчик ошибки загрузки изображения.
   *
   * @private
   * @method _onPhotoError
   */
  Photo.prototype._onPhotoError = function() {
    this.requestedPic.src = '';
    this.element.classList.remove('picture-load-process');
    this.element.classList.add('picture-load-failure');
    this.element.href = '#';
  };

  /**
   * Обработчик успешной загрузки изображения.
   *
   * @private
   * @method _onPhotoLoad
   */
  Photo.prototype._onPhotoLoad = function() {
    clearTimeout(this.imageLoadTimeout);
    this.element.classList.remove('picture-load-process');
    this.element.replaceChild(this.requestedPic, this.currentImg);
    this.element.href = this.requestedPic.src;
  };

  /**
   * Создание DOM-элемента на основе шаблона из списка pictures.json
   * теперь осуществляется через метод render() у прототипа объекта Photo.
   *
   * @method render
   */
  Photo.prototype.render = function() {
    // Вывод количеcтва лайков и комментариев:
    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

    // До загрузки картинки будет отображаться иконка-спиннер.
    this.element.classList.add('picture-load-process');

    // Загружаем изображение
    this.currentImg = this.element.querySelector('img');

    // Создаем новый экземпляр Image который будет работать с данными из json.
    this.requestedPic = new Image(182, 182);

    // Установка таймаута на загрузку изображения.
    this.imageLoadTimeout = setTimeout(this._onPhotoError, this.IMAGE_TIMEOUT);

    // Отмена таймаута при загрузке и замена картинок.
    this.requestedPic.onload = this._onPhotoLoad;

    // Обработка ошибки сервера
    this.requestedPic.onerror = this._onPhotoError;

    // Изменение src у изображения начинает загрузку.
    this.requestedPic.src = this._data.url;

    // В загруженные фотографии добавляется обработчик клика.
    this.element.addEventListener('click', this._onPhotoClick);
  };

  /**
   * @method onClick
   * @type {?Function}
   */
  Photo.prototype.onClick = null;

  /**
   * Метод удаления обработчика клика по картинке.
   *
   * @method remove
   */
  Photo.prototype.remove = function() {
    this.element.removeEventListener('click', this._onPhotoClick);
  };

  window.Photo = Photo;
})();
