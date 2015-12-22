/**
 * Конструктор и прототипы объекта Галерея.
 *
 * @author Max Maslenko (lynchnost@gmail.com)
 */
'use strict';

(function() {
  /**
   * @constructor Gallery
   */
  function Gallery() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = document.querySelector('.gallery-overlay-close');
    this._image = document.querySelector('.gallery-overlay-image');
    this._likes = document.querySelector('.likes-count');
    this._comments = document.querySelector('.comments-count');
    // Список изображений из json, изначально - пустой массив.
    this.pictures = [];
    // Индекс текущей картинки в галерее.
    this._currentImage = 0;

    // Привязка контекста обработки событий мыши и клавиатуры
    // к объекту Gallery в конструкторе.
    this._onCloseClick = this._onCloseClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
  }

  /**
   * Показ галереи.
   * @method show
   */
  Gallery.prototype.show = function() {
    this.element.classList.remove('invisible');

    // От�леживание событий мыши и клавиатуры в отображенной галерее.
    this.element.addEventListener('click', this._onCloseClick);
    this._closeButton.addEventListener('click', this._onCloseClick);
    this._image.addEventListener('click', this._onPhotoClick);
    document.addEventListener('keydown', this._onDocumentKeyDown);
  };

  /**
   * Скрытие галереи и удаление обработчиков ее �обытий.
   * @method hide
   */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._image.removeEventListener('click', this._onPhotoClick);
    this.element.removeEventListener('click', this._onCloseClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  };

  /**
   * Метод скрытия Галереи по клику (при условии, что кликают не на изображение).
   *
   * @private
   * @method _onCloseClick
   *
   * @param {Event} evt
   */
  Gallery.prototype._onCloseClick = function(evt) {
    if (!evt.target.classList.contains('gallery-overlay-image')) {
      this.hide();
    }
  };

  /**
   * Метод обработки событий клавиатуры (переключение и ESC).
   *
   * @private
   * @method _onDocumentKeyDown
   *
   * @param {Event} evt
   */
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    switch (evt.keyCode) {
      // Прячем по ESC.
      case 27:
        this.hide();
        break;
      // Стрелка влево.
      case 37:
        this.setCurrentPicture(--this._currentImage);
        break;
      // Стрелка вправо.
      case 39:
        this.setCurrentPicture(++this._currentImage);
        break;
    }
  };

  /**
   * Получение списка фотографий из json для объекта Галереи.
   *
   * @method setPictures
   * @param {Array.<Object>} pictures
   */
  Gallery.prototype.setPictures = function(pictures) {
    this.pictures = pictures;
  };

  /**
   * Установка текущей фотографии по ее индексу из json,
   * получение данных о фотографии (кол-во лайков и комментов).
   *
   * @method setCurrentPicture
   * @param {number} pos
   */
  Gallery.prototype.setCurrentPicture = function(pos) {
    var end = this.pictures.length - 1;

    // Проверяем и правим индекс
    if (pos < 0) {
      pos = end;
    } else if (pos > end) {
      pos = 0;
    }

    // Сохраняем позицию
    this._currentImage = pos;

    var currentPic = this.pictures[this._currentImage];
    this._image.src = currentPic.url;
    this._likes.textContent = currentPic.likes;
    this._comments.textContent = currentPic.comments;
  };

  /**
   * Обработчик клика по фотографии в галерее. Показывает следующую
   * по порядку фотографию, если она есть.
   *
   * @private
   * @method _onPhotoClick
   *
   * @param {Event} evt
   */
  Gallery.prototype._onPhotoClick = function(evt) {
    if (evt.target.classList.contains('gallery-overlay-image')) {
      this.setCurrentPicture(++this._currentImage);
    }
  };

  window.Gallery = Gallery;
})();
