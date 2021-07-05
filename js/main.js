'use strict';
const doc = document;
//const $body = document.querySelector('body');
const $openSearchBtn = doc.querySelector('#openSearchBtn');
const $openSearchMobileBtn = doc.querySelector('#openSearchMobileBtn');
const $searchModal = doc.querySelector('#searchModal');

const $cityModal = doc.querySelector('#cityModal')
const $openCityModalBtn = doc.querySelector('#openCityModalBtn')
const $openCityModalMobileBtn = doc.querySelector('#openCityModalMobileBtn');

const $addBasketModal = doc.querySelector('#addBasketModal');
const $addFavoriteModal = doc.querySelector('#addFavoriteModal');

const $callBackModal = doc.querySelector('#callBackModal')
const $openCallBackModalBtn = doc.querySelector('#openCallBackModalBtn')
const $openCallBackModalMobileBtn = doc.querySelector('#openCallBackModalMobileBtn');
const $consultationModal = doc.querySelector('#consultationModal');

const $callBackForm = doc.querySelector('#callBackForm');
const $fastOrdenForm = doc.querySelector('#fastOrdenForm');

const $basketCount = doc.querySelector('#basketCount');
const $favoriteCount = doc.querySelector('#favoriteCount');

const $map = doc.querySelector('#map');

class Server {
  constructor() {
    this._token = this.getToken();
    this.POST = 'GET';
    this.GET = 'GET';
    this.cityApi = '../json/city.json';
    this.fastOrderApi = '../json/getProd.json';
    this.addFavoriteApi = '../json/addFavorite.json';
    this.addBasketApi = '../json/addBasket.json';
    this.searchApi = '../json/search.json';
  }

  getCity = async () => {
    const data = {
      _token: this._token
    }
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.cityApi);
  }

  getFastOrderProduct = async (data) => {
    data._token = this._token;
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.fastOrderApi);
  }

  addFavorite = async (id) => {
    const data = {
      _token: this._token,
      id: id
    }
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.addFavoriteApi)
  }

  addBsasket = async (id, count) => {
    const data = {
      _token: this._token,
      id: id,
      count: count
    }
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, this.addBasketApi)
  }

  getContent = async (data) => {
    data._token = this._token;
    const formData = this.createFormData(data)
    return await this.getResponse(this.POST, formData, this.searchApi);
  }

  postForm = async ($form) => {
    const api = $form.action;
    const data = new FormData(this.$form);
    data.append('_token', this._token);
    return await this.getResponse(this.POST, data, api);
  }

  createFormData = (data) => {
    const formData = new FormData()
    for (let key in data) {
      formData.append(`${key}`, data[key])
    }

    //for (let [name, value] of formData) {
    //  console.log(`${name} = ${value}`);
    //}
    return formData;
  }

  getToken = () => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta.getAttribute('content');
  }

  getResponse = async (method, data, api) => {
    return await new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      let response = null
      xhr.open(method, api, true);
      xhr.send(data);
      xhr.onload = function () {
        if (xhr.status != 200) {
          console.log('Ошибка: ' + xhr.status);
          return;
        } else {
          response = JSON.parse(xhr.response);
          resolve(response);
          if (response) {
            console.log("Запрос отправлен");
          } else {
            console.log("Неудачная отправка");
          }
        }
      };
      xhr.onerror = function () {
        reject(new Error("Network Error"))
      };
    })
  }
}

class Render {
  constructor($parent) {
    this.$parent = $parent;
    this.spinnerText = '';
    this.errorMsg = '';
  }

  //Методы отресовки элементов
  renderSpiner = (spinnerText = '') => {
    this.spinnerText = spinnerText;
    this._render(this.$parent, this.getSpinnerHtml, false);
  }

  renderErrorMsg = (msg) => {
    const errorHtml = `
    <div class="rez-error">
      <p class="rez-error__msg">${msg}</p>
    </div>
    `;
    this.$parent.innerHTML = errorHtml;
  }

  renderListCity = (regionList, numCol = 1) => {
    this.clearParent();
    this.renderColumnsCityList(numCol);
    this.renderRegionList(regionList, numCol);
  }

  renderColumnsCityList = (numCol) => {
    for (let i = 1; i <= numCol; i++) {
      this._render(this.$parent, this.getColumnsCityListHtml, false);
    }
  }

  renderRegionList = (regionList, numCol) => {
    if (!this.$parent) {
      return;
    }
    if (!regionList) {
      return
    }
    const $columns = this.$parent.querySelectorAll('.city-list__col');

    const regionListLength = regionList.length;
    const numberSections = parseInt(regionListLength / numCol);
    const remainder = regionListLength % numCol;
    let start = 0;

    let end = start + numberSections;
    for (let i = 0; i <= numCol - 1; i++) {

      if (i + 1 <= remainder) {
        end = end + 1;

      }
      const arr = regionList.slice(start, end);
      start = end;
      end = start + numberSections;
      this._render($columns[i], this.getRegionHtml, arr);
    }
  }

  renderModalCard = (card) => {
    this._render(this.$parent, this.getModalCardHtml, card);
  }

  renderAddInfo = (type, info) => {
    const infoObj = {
      title: '',
      type: '',
      totalPrice: info.total_price.toLocaleString(),
      count: info.count
    }
    if (type === 'favorite') {
      infoObj.title = 'Товар добавлен в Избранное';
      infoObj.where = 'Избранном';
    }
    if (type === 'basket') {
      infoObj.title = 'Товар добавлен в Крозину';
      infoObj.where = 'Корзине';
    }
    this.$parent.innerHTML = this.getAddModalHtml(infoObj);
  }

  renderDeleteInfo = (type, info) => {
    const infoObj = {
      title: '',
      type: '',
      totalPrice: info.total_price.toLocaleString(),
      count: info.count.toLocaleString()
    }
    if (type === 'favorite') {
      infoObj.title = 'Товар удален из Избранного';
      infoObj.where = 'Избранном';
    }
    if (type === 'basket') {
      infoObj.title = 'Товар удален из Крозины';
      infoObj.where = 'Корзине';
    }
    this.$parent.innerHTML = this.getAddModalHtml(infoObj);
  }

  //Методы возвращающие разметку
  getSpinnerHtml = () => {
    const spinnerText = `<p class="spinner__text">${this.spinnerText}</p>`
    return (/*html*/`
      <div class="spinner" data-spinner>
        <div class="spinner__body loadingio-spinner-double-ring-z93jzk1i9p8">
          <div class="ldio-dkpata5megj">
            <div></div>
            <div></div>
            <div>
              <div></div>
            </div>
            <div>
              <div></div>
            </div>
          </div>
        </div>
       ${this.spinnerText ? spinnerText : ''}
      </div>
    `)

  }

  getRegionHtml = (region) => {
    let listCityHtml = this.getCityListHtml(region.parent);
    return (/*html*/`
      <li class="modal-search__region region" data-region data-dropdown>
        <div class="region__header" data-dropdown-btn>
          <i class="region__arrow" data-dropdown-arrow></i>
          <span class="redion__title" data-region-title>${region.title}</span>
        </div>
        <div class="region__list-body" data-dropdown-close="close">
          <ul class="region__list" data-dropdown-list>
            ${listCityHtml}
          </ul>
        </div>
      </li>
    `)
  }

  getCityListHtml = (cityList) => {
    let cityListHtml = '';
    cityList.map((city) => {
      cityListHtml = cityListHtml + this.getCityHtml(city);
    })
    return cityListHtml;
  }

  getCityHtml = (city) => {
    return (/*html*/`
    <li class="region__item" data-region-item>
      <a href="${city.slug}" class="region__link link" data-city>
        ${city.title}
      </a>
    </li>
    `)
  }


  getColumnsCityListHtml = () => {
    return (/*html*/`
    <ul class="city-list__col"></ul>
  `)
  }

  getModalCardHtml = (card) => {
    return (/*html*/`
    <div class="modal-card" data-modal-card data-id=${card.id}>
      <h3 class="modal-card__title" >
      ${card.title}
      </h3>
      <div class="modal-card__info">
        <div class="modal-card__price">
          <p class="modal-card__price-name">Цена за единицу (м/пог):</p>
          <p class="modal-card__price-grup">
          <span class="modal-card__price-num">${card.price}</span>
          <span class="modal-card__price-mark"> ₽</span>
          </p>
        </div>

        <div class="modal-card__counter counter" data-modal-counter>
          <input type="text" class="modal-card__input input counter__input" value="3" data-modal-input/>
          <div class="modal-card__controls counter__controls">
            <span class="modal-card__inc counter__btn" data-modal-btn="inc">
              <i class="modal-card__inc-icon
                  counter__icon counter__inc"></i>
            </span>
            <span class="modal-card__dec counter__btn" data-modal-btn="dec">
              <i class="modal-card__dec-icon
                  counter__icon counter__dec"></i>
            </span>
          </div>
        </div>

        <div class="modal-card__price">
          <p class="modal-card__price-name">Стоимость заказа:</p>
          <p  class="modal-card__price-grup">
          <span class="modal-card__price-num" data-modal-total>${card.total_price}</span>
          <span class="modal-card__price-mark"> ₽</span></p>
        </div>
      </div>
      </div>
    `)
  }

  getAddModalHtml = (infoObj) => {
    return (/*html*/`
    <h3 class="add-modal__title">${infoObj.title} </h3>
    <p class="add-modal__desc" data-desc>В ${infoObj.where} <span class="modal__total-product" data-total-item>${infoObj.count}
        товаров</span> на
      сумму
      <span class="modal__total-price" data-total-price>${infoObj.totalPrice} руб</span>
    </p>
    `)
  }

  //Общая функция отрисовки
  _render = ($parent, getHtmlMarkup, array = false) => {
    if (!$parent) {
      return;
    }
    let markupAsStr = '';
    if (array) {
      array.forEach((item) => {
        markupAsStr = markupAsStr + getHtmlMarkup(item);
      })
    }
    if (!array) {
      markupAsStr = getHtmlMarkup();
    }

    $parent.insertAdjacentHTML('beforeEnd', markupAsStr);
  }

  clearParent = ($parent = this.$parent) => {
    if (!$parent) {
      return;
    }
    $parent.innerHTML = '';
  }

  delete = (selector) => {
    const $el = this.$parent.querySelector(selector);
    $el.remove()
  }

}

class Modal {
  constructor(modalId) {
    this.$modal = doc.querySelector(modalId);
    this.initModal()
  }

  initModal = () => {
    if (!this.$modal) {
      return;
    }
    this.$resultBlock = this.$modal.querySelector('[data-result]');
    this.$body = doc.querySelector('body');
    this.server = new Server();
    this.closeModal();
  }
  open = () => {
    this.$modal.classList.remove('modal--is-hide');
    this.$modal.classList.add('modal--is-open');
    this.$body.classList.add('no-scroll');
  }

  close = () => {
    this.$modal.classList.remove('modal--is-open');
    setTimeout(() => {
      this.$modal.classList.add('modal--is-hide');
      this.$body.classList.remove('no-scroll');
      this.resultBlockHide();
    }, 500);

  }

  closeModal() {
    if (!this.$modal) {
      return
    }
    this.$modal.addEventListener('click', (e) => {
      const $elTarget = e.target;

      if ($elTarget.hasAttribute('data-close')) {
        this.close();
        return true;
      }
    })
  }

  getElement = (selector, all = false) => {
    if (!this.$modal) {
      return false;
    }
    if (all) {
      return this.$modal.querySelectorAll(selector);
    }
    return this.$modal.querySelector(selector);
  }

  resultBlockHide = () => {
    if (!this.$resultBlock) {
      return;
    }
    this.$resultBlock.classList.remove('modal__result--is-show');
  }
}

class SearchModal extends Modal {
  constructor(modalId) {
    super(modalId);
    this.init();
  }

  init = () => {
    if (!this.$modal) {
      return false;
    }
    this.$searchArea = this.getElement('#searchArea');
    this.$areaListBody = this.getElement('#areaListBody');
    this.$areaList = this.getElement('#areaList');
    this.$areaName = this.getElement('#areaName');
    this.$content = this.getElement('[data-content]');
    this.$spinnerWrap = this.getElement('[data-spinner-wrap]');
    this.value = '';
    this.area = '';
    this.renderSpinner = new Render(this.$spinnerWrap);
    this.render = new Render(this.$content);
    this.searchAreaListener();
    this.searchModalListener();
  }

  openSearch = () => {
    this.open();
    this.render.clearParent();
    this.$spinnerWrap.classList.add('modal-search__spinner--is-show');
    this.renderSpinner.renderSpiner('Идет закрузка...');
    this.renderContent();
  }

  //функции с AreaList
  slideToggleAreaList = () => {
    const isClose = this.$areaListBody.dataset.isClose;
    if (isClose === 'close') {
      this.openAreaList();
    }
    if (isClose === 'open') {
      this.closeAreaList();
    }

  }

  openAreaList = () => {
    const areaListHeight = this.$areaList.offsetHeight;
    this.$areaListBody.style.height = areaListHeight + 'px';

    setTimeout(() => {
      this.$areaListBody.dataset.isClose = 'open';
    }, 200)
  }

  closeAreaList = () => {
    this.$areaListBody.dataset.isClose = 'close';
    this.$areaListBody.style.height = 0 + 'px';
  }

  setAreaName = (radio) => {
    const $radio = radio;
    const area = $radio.dataset.area;
    this.$areaName.innerHTML = area;
    this.area = $radio.value;
  }

  renderContent = async () => {
    const response = await this.getContent();
  }

  getContent = () => {
    const data = {
      products: 0,
      caregory: 0,
      news: 0,
      value: this.value,
    }
    if (this.area === '') {
      data.products = 6;
      data.category = 4;
      data.news = 0;
      return this.server.getContent(data)
    }
    if (this.area === 'products') {
      data.products = 8;
      data.category = 0;
      data.news = 0;
      return this.server.getContent(data)
    }
    if (this.area === 'categoty') {
      data.products = 0;
      data.category = 8;
      data.news = 0;
      return this.server.getContent(data)
    }
    if (this.area === 'news') {
      data.products = 0;
      data.category = 0;
      data.news = 8;
      return this.server.getContent(data)
    }
  }

  //слушатели
  searchAreaListener = () => {
    if (!this.$searchArea) {
      return false;
    }
    this.$searchArea.addEventListener('click', this.slideToggleAreaList);
  }

  searchModalListener = () => {
    this.$modal.addEventListener('click', (e) => {
      const target = e.target;
      if (this.$areaListBody.dataset.isClose === 'open' && !target.closest('#areaListBody')) {
        this.closeAreaList();
        return true;
      }


    })

    this.$modal.addEventListener('input', (e) => {
      const target = e.target;
      if (target.closest('[sdfds]')) {
      }

    })

    this.$modal.addEventListener('change', (e) => {
      const target = e.target;
      if (target.closest('[name="type"]')) {
        this.setAreaName(target);
      }
    })

  }
}

class CityModal extends Modal {
  constructor(modalId) {
    super(modalId);
    this.initCityModal()
  }

  initCityModal = () => {
    if (!this.$modal) {
      return
    }
    this.$searchCityInput = this.getElement('#searchCityInput');
    this.$cityList = this.getElement('#cityList');
    this.render = new Render(this.$cityList);
    this.regionList = null;
    this.$listItem = null;
    this.inputValue = '';
    this.isHasRegionList = false;
    this.numCol = 1;
    this.changingSizeWindow();
    this.searchCityInputListener();
  }

  changingSizeWindow = () => {
    window.addEventListener('resize', () => {
      this.setNubColumns();
    });
  }

  setNubColumns = () => {
    let lientWidth = doc.documentElement.clientWidth;

    if (lientWidth < 500) {
      this.numCol = 1;

      this.render.renderListCity(this.regionList, this.numCol);
      return;
    }
    if (lientWidth < 750) {
      this.numCol = 2;

      this.render.renderListCity(this.regionList, this.numCol);
      return;
    }
    if (lientWidth < 900) {
      this.numCol = 3;

      this.render.renderListCity(this.regionList, this.numCol);
      return;
    }
    if (lientWidth > 900) {
      this.numCol = 4;

      this.render.renderListCity(this.regionList, this.numCol);
      return;
    }
  }

  openCityModal = async () => {
    this.open();
    if (this.isHasRegionList) {
      return;
    }
    if (!this.isHasRegionList) {
      this.render.clearParent();
      this.render.renderSpiner('Идет загрузка...');
      await this.createListCity();
    }

  }

  createListCity = async () => {
    const response = await this.server.getCity();
    if (!response.rez) {
      this.render.renderErrorMsg(response.error.desc);
      console.log(`Ошибка: ${response.error.id}`);
    }
    if (response.rez) {
      this.regionList = response.content;
      this.render.delete('[data-spinner]');
      this.setNubColumns();
      this.isHasRegionList = response.rez;
    }
  }

  searchCity = () => {
    this.changeInputValue();
    this.showFindedRegeon();
    this.showFindedCity();

  }

  changeInputValue = () => {
    this.inputValue = this.$searchCityInput.value.trim().toLowerCase();
  }

  showFindedRegeon = () => {
    if (this.inputValue == '') {
      this.setNubColumns();
      this.render.renderListCity(this.regionList, this.numCol);
      return;
    }
    if (this.inputValue != '') {
      const newRegionList = this.getNewArrRegeon();
      this.setNubColumns();
      this.render.renderListCity(newRegionList, this.numCol);
      this.openFindedRegeon();
    }


  }

  getNewArrRegeon = () => {
    const newRegionList = [];
    this.regionList.forEach(regeon => {
      const res = this.checkRegeon(regeon);
      if (res) {
        newRegionList.push(regeon);
      }
    })
    return newRegionList;
  }

  checkRegeon = (regeon) => {
    const regionName = regeon.title;
    const listCity = regeon.parent;

    let rez = false;
    rez = regionName.toLowerCase().includes(this.inputValue);
    listCity.forEach((city) => {
      rez = rez || city.title.toLowerCase().includes(this.inputValue);
    })

    return rez;
  };

  showFindedCity() {
    const $allRegionItems = this.getElement('[data-region-item]', true);
    $allRegionItems.forEach(($item) => {
      const $city = $item.querySelector('[data-city]');
      const cityName = $city.innerHTML.toLowerCase().trim();
      const rez = cityName.toLowerCase().includes(this.inputValue);
      this.hideCity($item);
      if (rez) {
        this.showCity($item);
      }
      if (!rez) {
        this.hideCity($item);
      }
    });
  }

  openFindedRegeon() {
    const $allCityList = this.getElement('[data-dropdown]', true);
    $allCityList.forEach(($cityList) => {
      const $dropdownBody = $cityList.querySelector('[data-dropdown-close]');
      const $arrow = $cityList.querySelector('[data-dropdown-arrow]');
      openDropdown($dropdownBody, $arrow);
    })
  }

  showCity($item) {
    $item.classList.remove('city-hide');
  }

  hideCity($item) {
    $item.classList.add('city-hide');
  }

  searchCityInputListener = () => {
    if (!this.$searchCityInput) {
      return false;
    }
    this.$searchCityInput.addEventListener('input', this.searchCity);
  }

}

class FastOrderModal extends Modal {
  constructor(modalId) {
    super(modalId);
    this.init();
  }

  init = () => {
    if (!this.$modal) {
      return;
    }
    this.$productModal = this.$modal.querySelector('[data-modal-wrap]');
    this.server = new Server();
    this.render = new Render(this.$productModal);
    this.listener();
  }
  openFastOrder = async ($btn) => {
    this.$btn = $btn
    this.open();
    this.render.clearParent();
    this.render.renderSpiner('Идет загрузка...');
    await this.createModalCard();
    this.$input = this.$modal.querySelector('[data-modal-input]');
    this.$totalPrice = this.$modal.querySelector('[data-modal-total]');
  }

  getProduct = async (count = 1) => {
    const $productCard = this.$btn.closest('[data-product-card]');
    const id = $productCard.dataset.id;
    return await this.server.getFastOrderProduct({
      id: id,
      count: count
    });
  }

  createModalCard = async () => {
    const response = await this.getProduct();
    if (!response.rez) {
      this.render.renderErrorMsg(response.error.desc);
      console.log(`Ошибка: ${response.error.id}`);
    }
    if (response.rez) {
      this.render.delete('[data-spinner]');
      this.render.renderModalCard(response.content);
    }
  }

  counter = (eTarget) => {
    const $btn = eTarget.closest('[data-modal-btn]');
    if ($btn.dataset.modalBtn === 'inc') {
      this.inc()
    }
    if ($btn.dataset.modalBtn === 'dec') {
      this.dec()
    }
  }

  inc = async () => {
    const count = parseInt(this.$input.value) + 1;
    const response = await this.getProduct(count);
    this.sentCountAndTotalPrice(response.content[0]);
  }

  dec = async () => {
    const count = parseInt(this.$input.value) - 1;
    if (count <= 0) {
      this.$input.value = 1;
      return;
    }
    const response = await this.getProduct(count);
    this.sentCountAndTotalPrice(response.content[0]);
  }

  changingValue = async () => {
    const count = this.checkCount(this.$input.value);
    const response = await this.getProduct(count);
    this.sentCountAndTotalPrice(response.content[0]);
  }

  checkCount = (count) => {
    let value = parseInt(count);
    if (count <= 0) {
      value = 1;
    }
    if (isNaN(value)) {
      value = 1;
    }
    return value;
  }

  sentCountAndTotalPrice = (card) => {
    this.$input.value = card.count;
    this.$totalPrice.innerHTML = card.total_price;
  }

  listener = () => {
    this.$modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-modal-btn]')) {
        this.counter(e.target);
      }
    })
    this.$modal.addEventListener('input', (e) => {
      if (e.target.closest('[data-modal-input]')) {

        this.changingValue();
      }
    })
  }
}

class ConsultationModal extends Modal {
  constructor(modalId) {
    super(modalId);
  }
}

class InfoModal {
  constructor(modalId) {
    this.$modal = doc.querySelector(modalId);
    this.init();

  }
  init = () => {
    this.productId = null;
    this.$modalInfo = this.$modal.querySelector('[data-info]');
    this.$productCard = null;
    this.response = null;
    this.server = new Server();
    this.render = new Render(this.$modalInfo);
    this.timeOut = null;
    this.closeModal();

  }

  open = ($productCard) => {
    if (this.$modal.dataset.add === 'open') {
      clearTimeout(this.timeOut);
    }
    this.timeOut = setTimeout(() => {
      this.close()
    }, 3000);
    this.$modal.classList.add('add-modal--is-open');
    this.$productCard = $productCard;
    this.productId = $productCard.dataset.id;
    this.$modal.dataset.add = 'open';

  }

  close = () => {
    clearTimeout(this.timeOut);
    this.$modal.classList.remove('add-modal--is-open');
    this.$modal.dataset.add = 'close';
  }

  closeModal = () => {
    if (!this.$modal) {
      return
    }
    this.$modal.addEventListener('click', (e) => {
      const $elTarget = e.target;

      if ($elTarget.hasAttribute('data-close')) {
        this.close();
        return true;
      }
    })
  }


  showSpinner = () => {
    this.render.clearParent();
    this.render.renderSpiner();
  }
  showError = (error) => {
    this.render.renderErrorMsg(error.desc);
    console.log(`Ошибка: ${error.id}`);
  }

}

class AddFavoriteModal extends InfoModal {
  constructor(modalId) {
    super(modalId);
  }

  init = () => {
    if (!this.$productCard) {
      return;
    }
    this.$stiker = this.$productCard.querySelector('[data-sticer-favirite]');
    this.$icon = this.$productCard.querySelector('[data-icon-favorite]');
    this.$addText = this.$productCard.querySelector('[add-favorite-text]');
    this.$favoriteCount = doc.querySelector('#favoriteCount');
  }

  openModal = ($productCard) => {
    this.open($productCard);
    this.init();
    this.renderInfo()
  }

  renderInfo = async () => {
    this.showSpinner();
    this.response = await this.server.addFavorite(this.productId);
    if (!this.response.rez) {
      this.showError(response.error);
    }
    if (this.response.rez) {
      this.render.delete('[data-spinner]');

      if (this.response.toggle) {
        this.add();
      }
      if (!this.response.toggle) {
        this.remove();
      }
    }
  }

  add = () => {
    this.render.renderAddInfo('favorite', this.response.favorite);
    if (this.$stiker) {
      this.$stiker.classList.add('product-card__stiker-icon--is-active');
    }
    if (this.$icon) {
      this.$icon.classList.add('favorite__icon--is-active');
    }
    if (this.$addText) {
      this.$addText.innerHTML = 'удалить из Избранное';
    }
    if (this.$favoriteCount) {
      this.$favoriteCount.innerHTML = this.response.favorite.count;
    }
  }

  remove = () => {
    this.render.renderDeleteInfo('favorite', this.response.favorite);
    if (this.$stiker) {
      this.$stiker.classList.remove('product-card__stiker-icon--is-active');
    }
    if (this.$icon) {
      this.$icon.classList.remove('favorite__icon--is-active');
    }
    if (this.$addText) {
      this.$addText.innerHTML = 'удалить из Избранное';
    }
    if (this.$favoriteCount) {
      this.$favoriteCount.innerHTML = this.response.favorite.count;
    }
  }

}

class AddBasketModal extends InfoModal {
  constructor(modalId) {
    super(modalId);
  }

  init = () => {
    if (!this.$productCard) {
      return;
    }
    this.$btn = this.$productCard.querySelector('[data-add-basket]')
    this.$basketCount = doc.querySelector('#basketCount');
    this.$input = this.$productCard.querySelector('[data-counter-input]')

  }

  openModal = ($productCard) => {
    this.open($productCard);
    this.init();
    this.renderInfo()
  }

  renderInfo = async () => {
    this.showSpinner();
    this.response = await this.server.addBsasket(this.productId);
    if (!this.response.rez) {
      this.showError(this.response.error);
    }
    if (this.response.rez) {
      this.render.delete('[data-spinner]');

      if (this.response.toggle) {
        this.add();
      }
      if (!this.response.toggle) {
        this.remove();
      }
    }
  }

  add = () => {
    this.render.renderAddInfo('basket', this.response.card);
    if (this.$basketCount) {
      this.$basketCount.innerHTML = this.response.card.count;
    }
    this.$btn.classList.remove('red-btn');
    this.$btn.classList.add('red-btn-bd');
    this.$btn.innerHTML = 'В карзине';
    this.$input.value = this.response.content[0].count;
    this.$productCard.dataset.inBasket = '1';
  }

  remove = () => {
    this.render.renderDeleteInfo('basket', this.response.card);
    if (this.$basketCount) {
      this.$basketCount = this.response.card.count;
    }
    this.$btn.classList.add('red-btn');
    this.$btn.classList.remove('red-btn-bd');
    this.$btn.innerHTML = 'Заказать';
    this.$productCard.dataset.inBasket = '0';
  }

}

class Form {
  constructor(formId) {
    this.$form = doc.querySelector(formId);
    this.regTel = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{5,10}$/;
    this.regMail = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/;

    this.formInit();
  }
  formInit = () => {
    if (!this.$form) {
      return false;
    }
    this.$inputs = this.$form.querySelectorAll('[data-input]');
    this.$formMsg = this.$form.querySelector('[data-form-msg]');
    this.$resultBlock = this.$form.closest('[data-modal]').querySelector('[data-result]');
    this.server = new Server();
  }

  formCheck = (...$inputs) => {
    let res = true;
    $inputs.forEach((item) => {
      res = this.checkInput(item) && res;
    })
    if (!res) {
      console.log('not sent');
      return res;
    }
    if (res) {
      console.log('sent');
      return res;
    }
  }

  checkInput = ($input) => {
    const name = $input.getAttribute('name');
    let result;
    switch (name) {
      case 'email':
        result = this.checkValue($input.value, this.regMail);
        this.statusVisualInput($input, result);
        break;
      case 'phone':
        result = this.checkValue($input.value, this.regTel);
        this.statusVisualInput($input, result);
        break;
      case 'message':
        //result = isEmptyInput(input.value);
        //statusVisualInput(input, result);
        break;
      case 'consent':
        result = this.checkCheckbox($input);
        this.statusVisualCheckbox($input, result);
        break;
      case 'password':
        //result = isEmptyInput(input.value);
        //statusVisualInput(input, result);
        break;
    }
    return result;
  }

  checkValue(value, reg) {
    return reg.test(value)
  }

  checkCheckbox(checkbox) {
    return checkbox.checked
  }

  statusVisualInput = ($input, result) => {
    const $inputBlock = $input.closest('[data-input-block]');
    const $inputMsg = $inputBlock.querySelector('[data-input-msg]');
    const placeholder = $inputMsg.dataset.placeholder;
    const value = $input.value.trim();
    if (result) {
      $inputMsg.innerHTML = placeholder;
      $inputMsg.classList.remove('placeholder--is-error');
      $inputBlock.classList.remove('input--is-error');
      return true;
    } else {
      if (value === '') {
        $inputMsg.innerHTML = 'Обязательное поле';
      } else {
        $inputMsg.innerHTML = 'Ошибка заполнения';
      }

      $inputMsg.classList.add('placeholder--is-error');
      $inputBlock.classList.add('input--is-error');
      return false;
    }
  }

  statusVisualCheckbox($checkbox, result = false) {
    const $checkboxBlock = $checkbox.closest('[checkbox-block]');
    if (!result) {
      $checkboxBlock.classList.add('animation-shake');
      setTimeout(() => {
        $checkboxBlock.classList.remove('animation-shake');

      }, 800)
      return;
    }
  }

  sendForm = async () => {
    const response = await this.server.postForm(this.$form);
    if (!response.rez) {
      this.showErrorMessage(response.error)
    }

    if (response.rez) {
      this.clearForm();

    }
  }

  showErrorMessage = (errorInfo) => {
    this.$formMsg.classList.add('form__message--is-show');
    this.$formMsg.innerHTML = errorInfo.desc;
    console.log(`Ошибка: ${errorInfo.id}`);
  }

  clearForm = () => {
    this.$inputs.forEach(($item) => {
      $item.value = '';
    })
    console.log(this.$textarea);
    if (this.$textarea) {
      this.$textarea.value = '';
    }

    this.$formMsg.classList.remove('form__message--is-show');
    this.$formMsg.innerHTML = '';
    this.resultBlockShow();
  }
}

class CallBackForm extends Form {
  constructor(formId) {
    super(formId);
    this.initCallbackForm();
  }
  initCallbackForm = () => {
    if (!this.$form) {
      return false;
    }
    this.$checkbox = this.$form.querySelector('[data-checkbox]');
    this.$submitBtn = this.$form.querySelector('[data-submit]');
    this.$inputPhone = this.$form.querySelector('[name="phone"]');
    this.listeners();
    this.send();
  }

  send = () => {
    this.$submitBtn.addEventListener('click', () => {
      const result = this.formCheck(this.$inputPhone, this.$checkbox);
      if (result) {
        this.sendForm();
      }
    });
  }

  resultBlockShow = () => {
    if (!this.$resultBlock) {
      return
    }
    this.$resultBlock.classList.add('modal__result--is-show');
  }
  listeners = () => {
    this.$inputPhone.addEventListener('blur', () => {
      this.checkInput(this.$inputPhone);
    })
  }


}

class FastOrdenForm extends Form {
  constructor(formId) {
    super(formId);
    this.initFastOrderForm();
  }

  initFastOrderForm = () => {
    if (!this.$form) {
      return false;
    }
    this.$checkbox = this.$form.querySelector('[data-checkbox]');
    this.$submitBtn = this.$form.querySelector('[data-submit]');
    this.$inputPhone = this.$form.querySelector('[name="phone"]');
    this.$inputMail = this.$form.querySelector('[name="email"]');
    this.listeners();
    this.send();
  }

  send = () => {
    this.$submitBtn.addEventListener('click', () => {
      const result = this.formCheck(this.$inputPhone, this.$inputMail, this.$checkbox);
      if (result) {
        this.sendForm();
      }
    });
  }

  resultBlockShow = () => {
    if (!this.$resultBlock) {
      return
    }
    this.$resultBlock.classList.add('modal__result--is-show');
  }
  listeners = () => {
    this.$inputPhone.addEventListener('blur', () => {
      this.checkInput(this.$inputPhone);
    })
    this.$inputMail.addEventListener('blur', () => {
      this.checkInput(this.$inputMail);
    })
  }
}
// формы
const callBackForm = new CallBackForm('#callBackForm');
const fastOrdenForm = new FastOrdenForm('#fastOrdenForm');

const server = new Server();
// окна
const searchModal = new SearchModal('#searchModal');
const cityModal = new CityModal('#cityModal');
const callBackModal = new CityModal('#callBackModal');
const fastOrderModal = new FastOrderModal('#fastOrdenModal');
const consultationModal = new ConsultationModal('#consultationModal');
const addFavoriteModal = new AddFavoriteModal('#addFavoriteModal', 'favorite');
const addBasketModal = new AddBasketModal('#addBasketModal', 'basket');

doc.addEventListener('click', docClickListener);
doc.addEventListener('input', docInputListener);

//окно поиска
if ($openSearchBtn && $searchModal) {
  $openSearchBtn.addEventListener('click', () => {
    searchModal.openSearch();
  });
}

if ($openSearchMobileBtn && $searchModal) {
  $openSearchMobileBtn.addEventListener('click', () => {
    searchModal.openSearch();
  });
}

//окно города
if ($openCityModalBtn && $cityModal) {
  $openCityModalBtn.addEventListener('click', () => {
    cityModal.openCityModal();
  });
}

if ($openCityModalMobileBtn && $cityModal) {
  $openCityModalMobileBtn.addEventListener('click', () => {
    cityModal.openCityModal();
  });
}

//callBackModal
if ($openCallBackModalBtn && $callBackModal) {
  $openCallBackModalBtn.addEventListener('click', () => {
    callBackModal.open();
  })
}

if ($openCallBackModalMobileBtn && $callBackModal) {
  $openCallBackModalMobileBtn.addEventListener('click', () => {
    callBackModal.open();
  })
}

// callBackForm
if ($callBackForm) {
  $callBackForm.addEventListener('submit', (e) => {
    e.preventDefault();
  })
}

// fastOrdenForm
if ($fastOrdenForm) {
  $fastOrdenForm.addEventListener('submit', (e) => {
    e.preventDefault();
  })
}

if ($map) {
  yandexMap();
}


function toggleDropdown(target) {
  if (target.closest('[data-dropdown-list]')) {
    return;
  }
  const $dropdownBody = getDropdownEl(target, '[data-dropdown-close]');
  const $arrow = getDropdownEl(target, '[data-dropdown-arrow]');
  const isClose = $dropdownBody.dataset.dropdownClose;

  if (isClose == 'close') {
    openDropdown($dropdownBody, $arrow)
  }

  if (isClose == 'open') {
    closeDropdown($dropdownBody, $arrow)
  }
}

function getDropdownEl(target, selector) {
  const $dropdown = target.closest('[data-dropdown]');
  return $dropdown.querySelector(selector);
}

function openDropdown($dropdownBody, $arrow) {
  const $dropdownList = $dropdownBody.querySelector('[data-dropdown-list]');
  const dropdownListHeight = $dropdownList.offsetHeight;
  $dropdownBody.style.height = dropdownListHeight + 'px';
  $arrow.classList.add('region__arrow--is-donw');
  $dropdownBody.dataset.dropdownClose = 'open';
}

function closeDropdown($dropdownBody, $arrow) {
  $dropdownBody.style.height = 0 + 'px';
  $arrow.classList.remove('region__arrow--is-donw');
  $dropdownBody.dataset.dropdownClose = 'close';
}

function addFavorite(target) {
  const $productCard = target.closest('[data-product-card]');
  addFavoriteModal.openModal($productCard);
  if ($addBasketModal.dataset.add === 'open') {
    addBasketModal.close();
  }
}

function addBasket(target) {
  const $productCard = target.closest('[data-product-card]');
  addBasketModal.openModal($productCard);
  if ($addFavoriteModal.dataset.add === 'open') {
    addFavoriteModal.close();
  }
}



function yandexMap() {
  let map;
  let marker;
  const dataCoord = $map.dataset.coordinates;
  const coordinates = dataCoord.split(',');
  function initMap() {
    map = new ymaps.Map("map", {
      center: coordinates,
      zoom: 16
    });
    marker = new ymaps.Placemark(coordinates, {
      hintContent: 'Расположение',
      balloonContent: 'Это наша организация'
    });
    map.geoObjects.add(marker);
  }
  ymaps.ready(initMap);
}



function docClickListener(e) {
  const target = e.target;
  if (target.closest('[data-fast-order]')) {
    fastOrderModal.openFastOrder(target);
  }
  if (target.closest('[data-dropdown]')) {
    toggleDropdown(target)
  }
  if (target.closest('[data-counter-inc]')) {
    counterInc(target);
  }
  if (target.closest('[data-add-favorite]')) {
    addFavorite(target);
  }
  if (target.closest('[data-add-basket]')) {
    addBasket(target);
  }
  if (target.closest('[data-counter-btn]')) {
    counter(target);
  }
}

function docInputListener(e) {
  const target = e.target;
  if (target.closest('[data-counter-input]')) {
    changingValue(target)
  }
}

function docChangListener(e) {
  const target = e.target;
  if (target.closest('[data-counter-input]')) {
    changingValue(target)
  }
}


// Функции счетчика товаров
function counter(target) {
  const $btn = target.closest('[data-counter-btn]');
  if ($btn.dataset.counterBtn === 'inc') {
    inc($btn);
  }
  if ($btn.dataset.counterBtn === 'dec') {
    dec($btn);
  }
}

async function inc($btn) {
  const cardObj = getProductCardObj($btn);
  const count = parseInt(cardObj.$input.value) + 1;
  if (cardObj.isInBasket === '0') {
    cardObj.$input.value = count;
  }

  if (cardObj.isInBasket === '1') {
    const response = await server.addBsasket(cardObj.id, count);
    console.log(response.content[0].count);
    cardObj.$input.value = response.content[0].count;
    $basketCount.innerHTML = response.card.count;
  }
}

async function dec($btn) {
  const cardObj = getProductCardObj($btn);
  const count = parseInt(cardObj.$input.value) - 1;

  if (cardObj.isInBasket === '0') {
    if (count < 0) {
      cardObj.$input.value = 1;
    }
    if (count > 0) {
      cardObj.$input.value = count;
    }
  }

  if (cardObj.isInBasket === '1') {
    const response = await server.addBsasket(cardObj.id, count);
    cardObj.$input.value = response.content[0].count;
    $basketCount.innerHTML = response.card.count;
  }
}

async function changingValue(target) {
  const $input = target.closest('[data-counter-input]');
  const cardObj = getProductCardObj($input);
  const count = checkCount(cardObj.$input.value);

  if (cardObj.isInBasket === '0') {
    cardObj.$input.value = count;
  }

  if (cardObj.isInBasket === '1') {
    const response = await server.addBsasket(cardObj.id, count);
    cardObj.$input.value = response.content[0].count;
    $basketCount.innerHTML = response.card.count;
  }
}

function getProductCardObj($el) {
  const $card = $el.closest('[data-product-card]');
  const $input = $card.querySelector('[data-counter-input]');
  const isInBasket = $card.dataset.inBasket;
  const id = $card.dataset.id;
  return {
    $card: $card,
    $input: $input,
    isInBasket: isInBasket,
    id: id,
  }
}

function checkCount(count) {
  let value = parseInt(count);
  if (count <= 0) {
    value = 1;
  }
  if (isNaN(value)) {
    value = 1;
  }
  return value;
}

//function debounce(f, t) {
//  return function (args) {
//    let previousCall = this.lastCall;
//    this.lastCall = Date.now();
//    if (previousCall && ((this.lastCall - previousCall) <= t)) {
//      clearTimeout(this.lastCallTimer);
//    }
//    this.lastCallTimer = setTimeout(() => f(args), t);
//  }
//}
