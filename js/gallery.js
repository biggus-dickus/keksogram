/**
 * Конструктор и прототипы объекта Галерея.
 * @author Max Maslenko (lynchnost@gmail.com)
 */

'use strict';

(function() {
  /**
   * @constructor
   */
  function Gallery() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeButton = document.querySelector('.gallery-overlay-close');
    this._image = document.querySelector('.gallery-overlay-image');
    this._likes = document.querySelector('.likes-count');
    this._comments = document.querySelector('.comments-count');
    // Список изображений из json, изначально - пустой массив.
    this.pictures = [];
    // Индекс текущей картинки в галерее.
    this._currentImage = 0;

    // Привязка контекста обработки событий мыши и клавиатуры
    // к объекту Gallery прямо в конструкторе.
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

    // Отслеживание событий мыши и клавиатуры в отображенной галерее.
    this._closeButton.addEventListener('click', this._onCloseClick);
    this._image.addEventListener('click', this._onPhotoClick);
    document.addEventListener('keydown', this._onDocumentKeyDown);
  };

  /**
   * Скрытие галереи и удаление обработчиков ее событий.
   * @method hide
   */
  Gallery.prototype.hide = function() {
    this.element.classList.add('invisible');
    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._image.removeEventListener('click', this._onPhotoClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  };

  /**
   * Обработчики клика по крестику, нажатия на ESC и клика по фотографии.
   * @private
   * @method hide
   */
  Gallery.prototype._onCloseClick = function() {
    this.hide();
  };

  /**
   * @private
   * @method hide
   * @param {Event} evt
   */
  Gallery.prototype._onDocumentKeyDown = function(evt) {
    if (evt.keyCode === 27) {
      this.hide();
    }

    // Нажатие на стрелку влево.
    if (evt.keyCode === 37) {
      if (this._currentImage === 0) {
        this._currentImage = this.pictures.length - 1;
        this.setCurrentPicture(this._currentImage);
      } else {
        this.setCurrentPicture(--this._currentImage);
      }
    }

    // Нажатие на стрелку вправо.
    if (evt.keyCode === 39) {
      if (this._currentImage === this.pictures.length - 1) {
        this._currentImage = 0;
        this.setCurrentPicture(this._currentImage);
      } else {
        this.setCurrentPicture(++this._currentImage);
      }
    }
  };

  /**
   * Получение списка фотографий из json для объекта Галереи.
   * @param {Array.<Object>} pictures
   * @method setPictures
   */
  Gallery.prototype.setPictures = function(pictures) {
    this.pictures = pictures;
  };

  /**
   * Установка текущей фотографии по ее индексу из json,
   * получение данных о фотографии (кол-во лайков и комментов).
   * @param {number} index
   * @method setCurrentPicture
   */
  Gallery.prototype.setCurrentPicture = function(i) {
    if (i <= this.pictures.length - 1) {
      this._currentImage = i;
      var currentPic = this.pictures[this._currentImage];
      this._image.src = currentPic.url;
      this._likes.textContent = currentPic.likes;
      this._comments.textContent = currentPic.comments;
    }
  };

  /**
   * Обработчик клика по фотографии в галерее. Показывает следующую
   * по порядку фотографию, если она есть.
   * @private
   */
  Gallery.prototype._onPhotoClick = function() {
    if (this.pictures[this._currentImage + 1]) {
      this.setCurrentPicture(++this._currentImage);
    } else {
      this._currentImage = 0;
      this._setCurrentPicture(this._currentImage);
    }
  };

  window.Gallery = Gallery;
})();
