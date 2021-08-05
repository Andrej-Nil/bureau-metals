'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const doc = document;
const $body = doc.querySelector('body');
const $popupList = doc.querySelectorAll('[data-popup-id]');
const $openSearchBtn = doc.querySelector('#openSearchBtn');
const $openSearchMobileBtn = doc.querySelector('#openSearchMobileBtn');
const $searchModal = doc.querySelector('#searchModal');
const $cityModal = doc.querySelector('#cityModal');
const $openCityModalBtn = doc.querySelector('#openCityModalBtn');
const $openCityModalMobileBtn = doc.querySelector('#openCityModalMobileBtn');
const $addBasketModal = doc.querySelector('#addBasketModal');
const $addFavoriteModal = doc.querySelector('#addFavoriteModal');
const $callBackModal = doc.querySelector('#callBackModal');
const $openCallBackModalBtn = doc.querySelector('#openCallBackModalBtn');
const $openCallBackModalMobileBtn = doc.querySelector('#openCallBackModalMobileBtn');
const $consultationModal = doc.querySelector('#consultationModal');
const $callBackForm = doc.querySelector('#callBackForm');
const $fastOrdenForm = doc.querySelector('#fastOrdenForm');
const $feedBackForm = doc.querySelector('#feedBackForm');
const $basket = doc.querySelector('#basket');
const $basketForm = doc.querySelector('#basketForm');
const $filters = doc.querySelector('#filters');
const $filterBtn = doc.querySelector('#filterBtn');
const $basketCount = doc.querySelector('#basketCount');
const $favoriteCount = doc.querySelector('#favoriteCount');
const $basketProductsTotalPrice = doc.querySelector('#basketProductsTotalPrice');
const $basketProductsCount = doc.querySelector('#basketProductsCount');
const $morePropWrap = doc.querySelector('#morePropWrap');
const $propMore = doc.querySelector('[data-prop-more]');
const $showPropBtn = doc.querySelector('#showPropBtn');
const $selects = doc.querySelectorAll('[data-select]');
const $mobileMenuBtn = doc.querySelector('#mobileMenuBtn');
const $mobileMenu = doc.querySelector('#mobileMenu');
const $map = doc.querySelector('#map');

class MobileMenu {
  constructor(id) {
    _defineProperty(this, "init", () => {
      if (!this.$menu) {
        return;
      }

      this.listner();
      this.catalogList = this.$menu.querySelector('[data-catalog-list]');
      this.render = new Render(this.catalogList);
      this.server = new Server();
    });

    _defineProperty(this, "open", () => {
      this.$menu.classList.add('mobile-nav--is-open');
      $body.classList.add('no-scroll');
      this.createCatalog();
    });

    _defineProperty(this, "close", () => {
      this.$menu.classList.remove('mobile-nav--is-open');
      $body.classList.remove('no-scroll');
    });

    _defineProperty(this, "createCatalog", async () => {
      if (this.catalogList.firstElementChild) {
        return;
      }

      const listId = this.catalogList.dataset.listId;
      this.render.renderSpiner('Идет загрузка...');
      const response = await this.server.getMenu(listId);

      if (response.rez == 0) {
        this.render.renderErrorMsg(response.error.desc);
        console.log(`Ошибка: ${response.error.id}`);
      }

      if (response.rez == 1) {
        const menuList = response.content;
        this.render.delete('[data-spinner]');
        this.render.renderMenu(menuList);
      }
    });

    _defineProperty(this, "listner", () => {
      this.$menu.addEventListener('click', e => {
        if (e.target.closest('[data-close]')) {
          this.close();
        }
      });
    });

    this.$menu = doc.querySelector(id);
    this.init();
  }

}

class Debaunce {
  constructor() {
    _defineProperty(this, "debaunce", (fn, ms) => {
      let timeout;
      return function () {
        const fnCall = () => {
          fn(arguments);
        };

        clearTimeout(timeout);
        timeout = setTimeout(fnCall, ms);
      };
    });
  }

}

class Server {
  constructor() {
    _defineProperty(this, "getCity", async () => {
      const data = {
        _token: this._token
      };
      const formData = this.createFormData(data);
      return await this.getResponse(this.POST, formData, this.cityApi);
    });

    _defineProperty(this, "getFastOrderProduct", async data => {
      data._token = this._token;
      const formData = this.createFormData(data);
      return await this.getResponse(this.POST, formData, this.fastOrderApi);
    });

    _defineProperty(this, "getMenu", async id => {
      const data = {
        _token: this._token,
        id: id
      };
      const formData = this.createFormData(data);
      return await this.getResponse(this.POST, formData, this.menuApi);
    });

    _defineProperty(this, "getFilterOptoinList", async fieldSlug => {
      const data = {
        _token: this._token,
        fieldSlug: fieldSlug
      };
      const formData = this.createFormData(data);
      return await this.getResponse(this.POST, formData, this.filterApi);
    });

    _defineProperty(this, "getRezToggleFilterCheckbox", async data => {
      data._token = this._token;
      const formData = this.createFormData(data);
      return await this.getResponse(this.POST, formData, this.filterCheckboxApi);
    });

    _defineProperty(this, "addFavorite", async id => {
      const data = {
        _token: this._token,
        id: id
      };
      const formData = this.createFormData(data);
      return await this.getResponse(this.POST, formData, this.addFavoriteApi);
    });

    _defineProperty(this, "addBsasket", async (id, count) => {
      const data = {
        _token: this._token,
        id: id,
        count: count
      };
      const formData = this.createFormData(data);
      return await this.getResponse(this.POST, formData, this.addBasketApi);
    });

    _defineProperty(this, "removeBasketCard", async id => {
      const data = {
        _token: this._token,
        id: id
      };
      const formData = this.createFormData(data);
      return await this.getResponse(this.POST, formData, this.removeBaskethApi);
    });

    _defineProperty(this, "getSearchContent", async data => {
      data._token = this._token;
      const formData = this.createFormData(data);
      return await this.getResponse(this.POST, formData, this.searchApi);
    });

    _defineProperty(this, "postForm", async $form => {
      const api = $form.action;
      const data = new FormData(this.$form);
      data.append('_token', this._token);
      return await this.getResponse(this.POST, data, api);
    });

    _defineProperty(this, "getResponse", async (method, data, api) => {
      return await new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        let response = null;
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
          reject(new Error("Network Error"));
        };
      });
    });

    _defineProperty(this, "createFormData", data => {
      const formData = new FormData();

      for (let key in data) {
        formData.append(`${key}`, data[key]);
      }

      return formData;
    });

    _defineProperty(this, "getToken", () => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta.getAttribute('content');
    });

    this._token = this.getToken();
    this.POST = 'GET';
    this.GET = 'GET';
    this.cityApi = '../json/city.json';
    this.fastOrderApi = '../json/getProd.json';
    this.addFavoriteApi = '../json/addFavorite.json';
    this.addBasketApi = '../json/addBasket.json';
    this.searchApi = '../json/search.json';
    this.removeBaskethApi = '../json/removeBasket.json';
    this.menuApi = '../json/sidebar.json';
    this.filterApi = '../json/filter.json';
    this.filterCheckboxApi = '../json/checkbox.json';
  }

}

class Filters {
  constructor(FiltersBlockId) {
    _defineProperty(this, "init", () => {
      if (!this.$filtersBlock) {
        return;
      }

      this.server = new Server();
      this.debaunce = new Debaunce();
      this.$selectedFilterList = this.$filtersBlock.querySelector('#selectedFilterList');
      this.render = new Render(this.$selectedFilterList);
      this.$filterListWrap = this.$filtersBlock.querySelector('#filterListWrap');
      this.$filterList = this.$filtersBlock.querySelectorAll('[data-filter]');
      this.$filterSticker = this.$filtersBlock.querySelector('#filterSticker');
      this.listener();
      this.creatingFilterOptions();
    });

    _defineProperty(this, "toggleOptionsList", target => {
      const filter = target.closest('[data-filter]');
      const status = filter.dataset.filter;

      if (status === 'close') {
        this.openFilter(filter);
      }

      if (status === 'open') {
        this.closeFilter(target);
      }
    });

    _defineProperty(this, "openFilter", filter => {
      this.closeFilter(filter);
      const filterBody = filter.querySelector('[data-body]');
      filter.classList.add('select--is-active');
      filterBody.classList.add('filter-body--is-open');
      filter.dataset.filter = 'open';
    });

    _defineProperty(this, "closeFilter", target => {
      if (!target) {
        return;
      }

      if (target.closest('[data-body]')) {
        return;
      }

      this.$filterList.forEach(item => {
        const filterBody = item.querySelector('[data-body]');
        item.classList.remove('select--is-active');
        filterBody.classList.remove('filter-body--is-open');
        item.dataset.filter = 'close';
      });
    });

    _defineProperty(this, "creatingFilterOptions", () => {
      this.$filterList.forEach($filter => {
        this.createOptionList($filter);
      });
    });

    _defineProperty(this, "createOptionList", async $filter => {
      const $optionList = $filter.querySelector('[data-option-list]');
      const $optionItems = $optionList.querySelectorAll('[data-li]');

      if ($optionItems.length) {
        return;
      }

      const fieldSlug = $filter.dataset.fieldSlug;
      this.render.renderSpiner('Загружаю...', $optionList);
      const response = await this.server.getFilterOptoinList(fieldSlug);

      if (response.rez == 0) {
        this.render.renderErrorMsg(response.error.desc, $optionList);
        console.log('Ошибка: ' + response.error.id);
      }

      if (response.rez == 1) {
        this.render.clearParent($optionList);
        this.render.renderOptionList(response.content, $optionList);
      }
    });

    _defineProperty(this, "searchOption", e => {
      const filter = e.target.closest('[data-filter]');
      const options = filter.querySelectorAll('[data-li]');
      const inputValue = e.target.value.trim().toLowerCase();
      options.forEach(li => {
        this.hideOption(li);
        const slug = li.dataset.li.trim().toLowerCase();

        if (slug.includes(inputValue)) {
          this.showOption(li);
        }

        if (inputValue == '') {
          this.showOption(li);
        }
      });
    });

    _defineProperty(this, "hideOption", option => {
      option.classList.add('option-hide');
    });

    _defineProperty(this, "showOption", option => {
      option.classList.remove('option-hide');
    });

    _defineProperty(this, "toggleSelectedOption", async target => {
      const $liOption = target.closest('[data-li]');
      const $checkbox = $liOption.querySelector('[data-checkbox]');
      const data = {
        field_slug: $checkbox.name,
        field_value_slug: $checkbox.value
      };
      const response = await this.server.getRezToggleFilterCheckbox(data);

      if (response.rez == 0) {
        this.toggleCheckboxWithRez0($checkbox);
        console.log('Ошибка: ' + response.error.id);
      }

      if (response.rez == 1) {
        this.toggleCheckboxWithRez1($checkbox, response);
        this.setFilterCount(response.count);
        this.showFilterSticker();
      }
    });

    _defineProperty(this, "toggleCheckboxWithRez0", $checkbox => {
      if (!$checkbox.checked) {
        this.createSelectedOption($checkbox);
        $checkbox.checked = true;
        return;
      }

      if ($checkbox.checked) {
        this.removeSelectedFilter($checkbox.dataset.id);
        $checkbox.checked = false;
        return;
      }
    });

    _defineProperty(this, "toggleCheckboxWithRez1", ($checkbox, response) => {
      if (response.toggle) {
        this.createSelectedOption($checkbox);
        $checkbox.checked = response.toggle;
        return;
      }

      if (!response.toggle) {
        this.removeSelectedFilter($checkbox.dataset.id);
        $checkbox.checked = response.toggle;
        return;
      }
    });

    _defineProperty(this, "createSelectedOption", $checkbox => {
      const infoOption = this.getInfoOption($checkbox);
      this.render.renderSelectedOption(infoOption);
    });

    _defineProperty(this, "deleteSelectedFilter", async $btn => {
      const $selectedOption = $btn.closest('[data-option]');
      const data = {
        field_slug: $selectedOption.dataset.activeFilter,
        field_value_slug: $selectedOption.dataset.option
      };
      const response = await this.server.getRezToggleFilterCheckbox(data);

      if (response.rez == 0) {
        this.checkboxOff($selectedOption);
        console.log('Ошибка: ' + response.error.id);
      }

      if (response.rez == 1) {
        this.checkboxOff($selectedOption);
      }
    });

    _defineProperty(this, "removeSelectedFilter", id => {
      const $selectedOptoin = this.$selectedFilterList.querySelector(`[data-id="${id}"]`);

      if ($selectedOptoin) {
        $selectedOptoin.remove();
      }
    });

    _defineProperty(this, "checkboxOff", $option => {
      const $filter = this.$filterListWrap.querySelector(`[data-field-slug="${$option.dataset.activeFilter}"]`);
      const $checkbox = $filter.querySelector(`[data-id="${$option.dataset.id}"]`);
      $checkbox.checked = false;
      this.removeSelectedFilter($checkbox.dataset.id);
    });

    _defineProperty(this, "setFilterCount", count => {
      const $tolal = this.$filterSticker.querySelector('#filtersTotal');
      $tolal.innerText = `Найдено ${count} товаров`;
    });

    _defineProperty(this, "showFilterSticker", () => {
      this.$filterSticker.classList.add('filters-sticker--is-show');
    });

    _defineProperty(this, "hideFilterSticker", () => {
      this.$filterSticker.classList.remove('filters-sticker--is-show');
    });

    _defineProperty(this, "resetAllFilters", async () => {
      const $checkboxList = this.$filterListWrap.querySelectorAll('[data-checkbox]');
      const data = {
        reset: true
      };
      const response = await this.server.getRezToggleFilterCheckbox(data);

      if (response.rez == 0) {
        console.log('Ошибка: ' + response.error.id);
      }

      this.$selectedFilterList.innerText = '';
      this.hideFilterSticker();
      $checkboxList.forEach($checkbox => {
        $checkbox.checked = false;
      });
    });

    _defineProperty(this, "getInfoOption", checkbox => {
      return {
        name: checkbox.name,
        value: checkbox.value,
        title: checkbox.dataset.title,
        id: checkbox.dataset.id
      };
    });

    _defineProperty(this, "listener", () => {
      this.$filtersBlock.addEventListener('click', e => {
        const target = e.target;

        if (target.closest('[data-filter]')) {
          this.toggleOptionsList(target);
        }

        if (target.closest('[data-remove]')) {
          this.deleteSelectedFilter(target);
        }

        if (target.closest('[data-li]')) {
          this.toggleSelectedOption(e.target);
        }

        if (target.closest('#filterStickerClose')) {
          this.hideFilterSticker();
        }

        if (target.closest('[data-reset]')) {
          this.resetAllFilters();
        }
      });
      this.$filtersBlock.addEventListener('input', e => {
        if (e.target.closest('[data-input]')) {
          this.searchOption(e);
        } //if (e.target.closest('[data-checkbox]')) {
        //  this.toggleSelectedOption(e.target);
        //}

      });
      doc.addEventListener('click', e => {
        const target = e.target;

        if (!target.closest('[data-filter]')) {
          this.closeFilter(target);
        }
      });
    });

    this.$filtersBlock = doc.querySelector(FiltersBlockId);
    this.init();
  }

}

class Render {
  constructor(_$parent = null) {
    _defineProperty(this, "renderSpiner", (spinnerText = '', $parent = this.$parent) => {
      this.spinnerText = spinnerText;

      this._render($parent, this.getSpinnerHtml, false);
    });

    _defineProperty(this, "renderErrorMsg", (msg, $parent = this.$parent) => {
      const errorHtml = `
    <div class="rez-error">
      <p class="rez-error__msg">${msg}</p>
    </div>
    `;
      $parent.innerHTML = errorHtml;
    });

    _defineProperty(this, "renderOptionList", (optionList, $parent) => {
      this._render($parent, this.getOptionLiHtml, optionList);
    });

    _defineProperty(this, "renderListCity", (regionList, numCol = 1) => {
      this.clearParent();
      this.renderColumnsCityList(numCol);
      this.renderRegionList(regionList, numCol);
    });

    _defineProperty(this, "renderColumnsCityList", numCol => {
      for (let i = 1; i <= numCol; i++) {
        this._render(this.$parent, this.getColumnsCityListHtml, false);
      }
    });

    _defineProperty(this, "renderRegionList", (regionList, numCol) => {
      if (!this.$parent) {
        return;
      }

      if (!regionList) {
        return;
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
    });

    _defineProperty(this, "renderMenu", (menuList, $parent = this.$parent) => {
      this._render($parent, this.getMemuListHtml, menuList);
    });

    _defineProperty(this, "renderSelectedOption", infoOption => {
      const selectedOptionHtml =
        /*html*/
        `
    <div data-active-filter="${infoOption.name}" 
    data-option="${infoOption.value}" 
    data-id="${infoOption.id}"
    class="filters__active-item">
    <span class="filter__active-name">${infoOption.title}</span>
    <span data-remove class="filter__active-remove"></span>
  </div>
    `;
      this.$parent.insertAdjacentHTML('beforeEnd', selectedOptionHtml);
    });

    _defineProperty(this, "renderModalCard", card => {
      this._render(this.$parent, this.getModalCardHtml, card);
    });

    _defineProperty(this, "renderAddInfo", (type, info) => {
      const infoObj = {
        title: '',
        type: '',
        totalPrice: info.total_price.toLocaleString(),
        count: info.count
      };

      if (type === 'favorite') {
        infoObj.title = 'Товар добавлен в Избранное';
        infoObj.where = 'Избранном';
      }

      if (type === 'basket') {
        infoObj.title = 'Товар добавлен в Крозину';
        infoObj.where = 'Корзине';
      }

      this.$parent.innerHTML = this.getAddModalHtml(infoObj);
    });

    _defineProperty(this, "renderSearchContent", response => {
      if (response.categoty !== undefined) {
        this.renderSearchCategory(response.categoty);
      }

      if (response.products !== undefined) {
        this.renderSearchProducts(response.products);
      }

      if (response.news !== undefined) {
        this.renderSearchNews(response.news);
      }
    });

    _defineProperty(this, "renderSearchCategory", category => {
      const listCategoryHtml = this.createItemListHtml(category, this.getSearchCategoryHtml);
      const caregoryHtml =
        /*html*/
        `
    <div class="modal-search__cards">
      ${listCategoryHtml}
    </div>
    `;
      this.$parent.insertAdjacentHTML('beforeEnd', caregoryHtml);
    });

    _defineProperty(this, "renderSearchNews", category => {
      const listNewsHtml = this.createItemListHtml(category, this.getSearchNewsHtml);
      const newsHtml =
        /*html*/
        `
    <div class="modal-search__cards">
      ${listNewsHtml}
    </div>
    `;
      this.$parent.insertAdjacentHTML('beforeEnd', newsHtml);
    });

    _defineProperty(this, "renderSearchProducts", products => {
      const listProductsHtml = this.createItemListHtml(products, this.getSearchProductHtml);
      const productsHtml =
        /*html*/
        `
    <div class="modal-search__list">
      ${listProductsHtml}
    </div>
    `;
      this.$parent.insertAdjacentHTML('beforeEnd', productsHtml);
    });

    _defineProperty(this, "renderBasketCard", productCard => {
      const $basketList = this.$parent.querySelector('#basketList');

      this._render($basketList, this.getBasketCardHtml, productCard, 'afterbegin');
    });

    _defineProperty(this, "createItemListHtml", (arr, getHtmlMarkup) => {
      let itemListHtml = '';
      arr.map(item => {
        itemListHtml = itemListHtml + getHtmlMarkup(item);
      });
      return itemListHtml;
    });

    _defineProperty(this, "renderDeleteInfo", (type, info) => {
      const infoObj = {
        title: '',
        type: '',
        totalPrice: info.total_price.toLocaleString(),
        count: info.count.toLocaleString()
      };

      if (type === 'favorite') {
        infoObj.title = 'Товар удален из Избранного';
        infoObj.where = 'Избранном';
      }

      if (type === 'basket') {
        infoObj.title = 'Товар удален из Крозины';
        infoObj.where = 'Корзине';
      }

      this.$parent.innerHTML = this.getAddModalHtml(infoObj);
    });

    _defineProperty(this, "getSpinnerHtml", () => {
      const spinnerText = `<p class="spinner__text">${this.spinnerText}</p>`;
      return (
        /*html*/
        `
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
    `
      );
    });

    _defineProperty(this, "getRegionHtml", region => {
      let listCityHtml = this.getCityListHtml(region.parent);
      return (
        /*html*/
        `
      <li class="modal-search__region region" data-region data-dropdown>
        <div class="region__header" data-dropdown-btn>
          <i class="region__arrow dropdown__arrow" data-dropdown-arrow></i>
          <span class="redion__title" data-region-title>${region.title}</span>
        </div>
        <div class="region__list-body" data-dropdown-close="close">
          <ul class="region__list" data-dropdown-list>
            ${listCityHtml}
          </ul>
        </div>
      </li>
    `
      );
    });

    _defineProperty(this, "getCityListHtml", cityList => {
      let cityListHtml = '';
      cityList.map(city => {
        cityListHtml = cityListHtml + this.getCityHtml(city);
      });
      return cityListHtml;
    });

    _defineProperty(this, "getCityHtml", city => {
      return (
        /*html*/
        `
    <li class="region__item" data-region-item>
      <a href="${city.slug}" class="region__link link" data-city>
        ${city.title}
      </a>
    </li>
    `
      );
    });

    _defineProperty(this, "getColumnsCityListHtml", () => {
      return (
        /*html*/
        `
    <ul class="city-list__col"></ul>
  `
      );
    });

    _defineProperty(this, "getMemuListHtml", item => {
      if (item.isSubmenu == false) {
        return (
          /*html*/
          `
        <li class="nav-list__item">
          <a href="${item.slug}" class="nav-list__link">${item.title}</a>
        </li>
      `
        );
      }

      if (item.isSubmenu == true) {
        return (
          /*html*/
          `
      <li class="nav-list__item" data-dropdown>
        <div class="dropdown__header" data-dropdown-header>
          <i class="nav-list__arrow" data-dropdown-btn data-dropdown-arrow data-list-id="${item.id}"></i>
          <a href="${item.slug}" class="nav-list__link">${item.title}</a>
        </div>
        <div class="dropdown__body" data-dropdown-close="close">
          <ul class="nav-list" data-dropdown-list>
            
          </ul>
        </div>
      </li>
    `
        );
      }
    });

    _defineProperty(this, "getSubmenuHtml", item => {
      return (
        /*html*/
        `
    <li class="nav-list__item">
      <a href="${item.slug}" class="nav-list__sublink">${item.title}</a>
    </li>
  `
      );
    });

    _defineProperty(this, "getModalCardHtml", card => {
      return (
        /*html*/
        `
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
    `
      );
    });

    _defineProperty(this, "getAddModalHtml", infoObj => {
      return (
        /*html*/
        `
    <h3 class="add-modal__title">${infoObj.title} </h3>
    <p class="add-modal__desc" data-desc>В ${infoObj.where} <span class="modal__total-product" data-total-item>${infoObj.count}
        товаров</span> на
      сумму
      <span class="modal__total-price" data-total-price>${infoObj.totalPrice} руб</span>
    </p>
    `
      );
    });

    _defineProperty(this, "getSearchCategoryHtml", item => {
      return (
        /*html*/
        `
    <a href="${item.slug}" class="small-card">
      <div class="small-card__preview">
        <picture class="small-card__picture">
          <source srcset="${item.photo_webp}" type="image/webp">
          <img src="${item.photo}" alt="" class="small-card__img">
        </picture>
      </div>
      <div class="small-card__info">
        <div class="small-card__title">${item.title}</div>
        <div class="small-card__desc">${item.desc}</div>
      </div>
    </a>
    `
      );
    });

    _defineProperty(this, "getSearchNewsHtml", item => {
      return (
        /*html*/
        `
    <a href="${item.slug}" class="small-card">
      <div class="small-card__preview">
        <picture class="small-card__picture">
          <source srcset="${item.photo_webp}" type="image/webp">
          <img src="${item.photo}" alt="" class="small-card__img">
        </picture>
      </div>
      <div class="small-card__info">
        <div class="small-card__title">${item.title}</div>
        <div class="small-card__desc">${item.date}</div>
      </div>
    </a>
    `
      );
    });

    _defineProperty(this, "getSearchProductHtml", item => {
      return (
        /*html*/
        `
    <a href="${item.slug}" class="search-card">
      <h3 class="search-card__title">
        ${item.title}
      </h3>

      <div class="search-card__price price">
        <span class="search-card__old price__old">${item.price_old}</span>
        <span class="search-card__new price__new">
          <span class="search-card__price-num price__num ">${item.price}</span>
          <span class="search-card__price-mark price__mark">₽</span><span
            class="search-card__price-unit price__unit">/кг</span>
        </span>
      </div>
    </a>
    `
      );
    });

    _defineProperty(this, "getBasketCardHtml", item => {
      const favoriteCls = item.isFavorite ? 'favorite__icon--is-active' : '';
      const favoriteText = item.isFavorite ? 'удалить из Избранное' : 'добавить в Избранное';
      return (
        /*html*/
        `
      <div class="basket-card" data-product-card data-id="566" data-in-basket="1">
        <i class="basket-card__remove" data-remove-card></i>
        <div class="basket-card__top">
          <h3 class="basket-card__title">
            <a href="product-page.html" class="basket-card__link link">
            ${item.title}
            </a>
          </h3>

          <div class="basket__favorite favorite" data-add-favorite>
            <i class="product-card__favorite-icon favorite__icon ${favoriteCls}" data-icon-favorite></i>
            <span class="favorite__add " data-add-favorite-text>${favoriteText}</span>
          </div>

        </div>

        <div class="basket-card__bottom">
          <div class="basket-card__price price">
            <span class="basket-card__price-old price__old">${item.price_old}</span>
            <span class="price__new">
              <span class="basket__price-num price__num">${item.price}</span>
              <span class="basket__price-mark price__mark">₽</span><span
                class="basket__price-unit price__unit">/кг</span>
            </span>
          </div>

          <div class="basket-card__counter counter" data-counter>
            <input type="text" class="basket-card__input input counter__input" value="${item.count}" data-counter-input />
            <div class=" counter__controls">
              <span class="basket-card__counter-btn counter__btn" data-counter-btn="inc">
                <i class="basket-card__counter-icon 
                      counter__icon counter__inc
                    "></i>
              </span>
              <span class="basket-card__counter-btn counter__btn" data-counter-btn="dec">
                <i class="basket-card__counter-icon 
                      counter__icon counter__dec
                    "></i>
              </span>
            </div>
          </div>

          <div class="basket-card__price">
            <span class="basket-card__price-num" data-total-price>${item.total_price}</span><span
              class="basket-card__price-mark">₽</span>
          </div>
        </div>
        <div class="basket-rez" data-basket-rez></div>
      </div>
    `
      );
    });

    _defineProperty(this, "getOptionLiHtml", item => {
      const isChecked = item.checked ? 'checked' : '';
      return (
        /*html*/
        `
      <li data-li="${item.field_value_name}"
     class="options__item">

        <div class="options__label">
          <input type="checkbox" name="${item.field_slug}" class="options__checkbox checkbox" data-checkbox
            value="${item.field_value_slug}" 
            ${isChecked}
            data-title="${item.field_value_name}"
            data-id="${item.field_slug + item.field_value_slug}"
            >
          <span class="options__checkbox  fake-checkbox"></span>
          <span data-value_slug class="options__name">
          ${item.field_value_name}
          </span>
          <span class="options__count">${item.count}</span>
        </div>

      </li>
    `
      );
    });

    _defineProperty(this, "_render", ($parent, getHtmlMarkup, array = false, where = 'beforeend') => {
      if (!$parent) {
        return;
      }

      let markupAsStr = '';

      if (array) {
        array.forEach(item => {
          markupAsStr = markupAsStr + getHtmlMarkup(item);
        });
      }

      if (!array) {
        markupAsStr = getHtmlMarkup();
      }

      $parent.insertAdjacentHTML(where, markupAsStr);
    });

    _defineProperty(this, "clearParent", ($parent = this.$parent) => {
      if (!$parent) {
        return;
      }

      $parent.innerHTML = '';
    });

    _defineProperty(this, "delete", selector => {
      const $el = this.$parent.querySelector(selector);
      $el.remove();
    });

    this.$parent = _$parent;
    this.spinnerText = '';
    this.errorMsg = '';
  } //Методы отресовки элементов


}

class Modal {
  constructor(modalId) {
    _defineProperty(this, "initModal", () => {
      if (!this.$modal) {
        return;
      }

      this.$resultBlock = this.$modal.querySelector('[data-result]');
      this.$body = doc.querySelector('body');
      this.server = new Server();
      this.closeModal();
    });

    _defineProperty(this, "open", () => {
      this.$modal.classList.remove('modal--is-hide');
      this.$modal.classList.add('modal--is-open');
      this.$body.classList.add('no-scroll');
    });

    _defineProperty(this, "close", () => {
      this.$modal.classList.remove('modal--is-open');
      setTimeout(() => {
        this.$modal.classList.add('modal--is-hide');
        this.$body.classList.remove('no-scroll');
        this.resultBlockHide();
      }, 500);
    });

    _defineProperty(this, "getElement", (selector, all = false) => {
      if (!this.$modal) {
        return false;
      }

      if (all) {
        return this.$modal.querySelectorAll(selector);
      }

      return this.$modal.querySelector(selector);
    });

    _defineProperty(this, "resultBlockHide", () => {
      if (!this.$resultBlock) {
        return;
      }

      this.$resultBlock.classList.remove('modal__result--is-show');
    });

    this.$modal = doc.querySelector(modalId);
    this.initModal();
  }

  closeModal() {
    if (!this.$modal) {
      return;
    }

    this.$modal.addEventListener('click', e => {
      const $elTarget = e.target;

      if ($elTarget.hasAttribute('data-close')) {
        this.close();
        return true;
      }
    });
  }

}

class Basket {
  constructor(basketId) {
    _defineProperty(this, "init", () => {
      if (!this.$basket) {
        return;
      }

      this.render = new Render(this.$basket);
      this.server = new Server();
      this.$basketList = doc.querySelector('#basketList');
      this.$basketPrice = doc.querySelector('#basketProductsTotalPrice');
      this.$basketCount = doc.querySelector('#basketProductsCount');
      this.$basketCard = null;
      this.$basketCardRez = null;
      this.listener();
    });

    _defineProperty(this, "removeBasketCard", async () => {
      const id = this.$basketCard.dataset.id;
      this.$basketCardRez = this.$basketCard.querySelector('[data-basket-rez]');
      this.showSpinner();
      const response = await this.server.removeBasketCard(id);

      if (!response.rez) {
        this.showErrorMsg(response.error);
      }

      if (response.rez) {
        this.$basketCardRez.innerHTML = '';
        this.$basketCard.remove();
        this.setTotalBasket(response.card);
        const $basketCardList = this.$basketList.querySelectorAll('[data-product-card]');

        if (!$basketCardList.length) {
          this.$basketList.innerHTML = '<p data-empty>Корзина пустая</p>';
        }
      }
    });

    _defineProperty(this, "addInBasket", infoProduct => {
      if (this.$basketList) {
        const id = infoProduct.content[0].id;
        const rez = this.checkingForProductAvailability(id);

        if (!rez) {
          this.addCardInBasket(infoProduct);
        }
      }
    });

    _defineProperty(this, "addCardInBasket", infoProduct => {
      const $basketCardList = this.$basketList.querySelectorAll('[data-product-card]');

      if (!$basketCardList.length) {
        this.$basketList.innerHTML = '';
      }

      this.render.renderBasketCard(infoProduct.content);
      this.setTotalBasket(infoProduct.card);
    });

    _defineProperty(this, "checkingForProductAvailability", id => {
      const $basketCardList = this.$basketList.querySelectorAll('[data-product-card]');
      let rez = false;

      for (let i = 0; i <= $basketCardList.length - 1; i++) {
        if ($basketCardList[i].dataset.id == id) {
          rez = true;
        }
      }

      return rez;
    });

    _defineProperty(this, "setTotalBasket", totalBasketObj => {
      if (this.$basketPrice) {
        this.$basketPrice.innerHTML = totalBasketObj.total_price.toLocaleString() + '  ₽';
      }

      if (this.$basketCount) {
        this.$basketCount.innerHTML = totalBasketObj.count;
      }
    });

    _defineProperty(this, "showBasketCardRez", () => {
      this.$basketCardRez.classList.add('basket-rez--is-show');
      this.$basketCardRez.classList.add('basket-rez--opacity');
    });

    _defineProperty(this, "hideshowBasketCardRez", () => {
      this.$basketCardRez.classList.add('basket-rez--transition');
      setTimeout(() => {
        this.$basketCardRez.classList.remove('basket-rez--opacity');
      }, 1500);
      setTimeout(() => {
        this.$basketCardRez.classList.remove('basket-rez--is-show');
        this.$basketCardRez.innerHTML = '';
      }, 3000);
    });

    _defineProperty(this, "showErrorMsg", errorInfo => {
      this.render.renderErrorMsg(errorInfo.desc, this.$basketCardRez);
      this.hideshowBasketCardRez();
    });

    _defineProperty(this, "showSpinner", () => {
      this.showBasketCardRez();

      this.render._render(this.$basketCardRez, this.render.getSpinnerHtml);
    });

    this.$basket = doc.querySelector(basketId);
    this.init();
  }

  listener() {
    this.$basket.addEventListener('click', e => {
      const target = e.target;

      if (e.target.closest('[data-remove-card]')) {
        this.$basketCard = target.closest('[data-product-card]');
        this.removeBasketCard();
      }
    });
  }

}

class Slider {
  constructor(sliderId, breakingPoints) {
    _defineProperty(this, "navigation", () => {
      if (this.$nextBtn) {
        this.$nextBtn.addEventListener('click', this.next);
      }

      if (this.$prevBtn) {
        this.$prevBtn.addEventListener('click', this.prev);
      }

      if (this.$dotsWrap) {
        this.$dotsWrap.addEventListener('click', e => {
          const target = e.target;

          if (target.closest('[data-dot]')) {
            this.dotNavigation(target.closest('[data-dot]'));
          }
        });
      }

      if (this.$dotsPicWrap) {
        this.$dotsPicWrap.addEventListener('click', e => {
          const target = e.target;

          if (target.closest('[data-pic-dot]')) {
            this.dotPicNavigation(target.closest('[data-pic-dot]'));
          }
        });
      }
    });

    _defineProperty(this, "next", () => {
      if (!this.$nextBtn) {
        return;
      }

      if (this.i == this.quantitySlides - this.displaySlides) {
        return;
      }

      this.i++;
      this.trackShift();

      if (this.$dotsWrap) {
        this.setActiveDot();
      }

      if (this.$dotsPicWrap) {
        this.setActivePicDot();
        this.trackPicDotsShift();
      }
    });

    _defineProperty(this, "prev", () => {
      if (this.i == 0) {
        return;
      }

      this.i--;
      this.trackShift();

      if (this.$dotsWrap) {
        this.setActiveDot();
      }

      if (this.$dotsPicWrap) {
        this.setActivePicDot();
        this.trackPicDotsShift();
      }
    });

    _defineProperty(this, "trackShift", () => {
      const slideWidth = this.$slides[0].offsetWidth;
      const slideMarginRight = parseInt(getComputedStyle(this.$slides[0], true).marginRight);
      const step = slideWidth + slideMarginRight;
      const trackShift = this.i * step;
      this.$track.style.transform = `translate(-${trackShift}px, 0)`;
    });

    _defineProperty(this, "dotNavigation", $dot => {
      this.i = $dot.dataset.idx;
      this.setActiveDot();
      this.trackShift();
    });

    _defineProperty(this, "setActiveDot", () => {
      this.$dotList.forEach(($dot, idx) => {
        $dot.classList.remove('section-dots__item--is-active');

        if (idx == this.i) {
          $dot.classList.add('section-dots__item--is-active');
        }
      });
    });

    _defineProperty(this, "setFirstSlide", () => {
      this.i = 0;
      this.trackShift();

      if (this.$dotsWrap) {
        this.setActiveDot();
      }

      if (this.$dotsPicWrap) {
        this.setActivePicDot();
        this.trackPicDotsShift();
      }
    });

    _defineProperty(this, "setActivePicDot", () => {
      this.$dotPicList.forEach(($dot, idx) => {
        $dot.classList.remove('product__dot--is-active');

        if (idx == this.i) {
          $dot.classList.add('product__dot--is-active');
        }
      });
    });

    _defineProperty(this, "trackPicDotsShift", () => {
      let countDot = this.i - 1;

      if (countDot < 0) {
        countDot = 0;
      }

      if (this.i >= this.$dotPicList.length - 1) {
        countDot = this.$dotPicList.length - 3;
      }

      const dotWidth = this.$dotPicList[0].offsetHeight;
      const dotMarginRight = parseInt(getComputedStyle(this.$dotPicList[0], true).marginRight);
      const step = dotWidth + dotMarginRight;
      const dotsTrackShift = countDot * step;
      this.$dotPicTrack.style.transform = `translate(-${dotsTrackShift}px, 0)`;
    });

    _defineProperty(this, "dotPicNavigation", $dot => {
      this.i = $dot.dataset.idx;
      this.trackShift();
      this.setActivePicDot();
      this.trackPicDotsShift();
    });

    _defineProperty(this, "startTouchMove", e => {
      this.touchStart = e.changedTouches[0].clientX;
      this.touchPosition = this.touchStart;
    });

    _defineProperty(this, "touchMove", e => {
      this.touchPosition = e.changedTouches[0].clientX;
    });

    _defineProperty(this, "touchEnd", () => {
      let distance = this.touchStart - this.touchPosition;

      if (distance > 0 && distance >= this.sensitivity) {
        this.next();
      }

      if (distance < 0 && distance * -1 >= this.sensitivity) {
        this.prev();
      }
    });

    _defineProperty(this, "createDotList", () => {
      const countDot = this.$slides.length - this.displaySlides;
      let dotsHtml = '';

      for (let i = 0; countDot >= i; i++) {
        const cls = this.i == i ? 'section-dots__item--is-active' : '';
        dotsHtml +=
          /*html*/
          `<div class="section-dots__item ${cls}" data-dot data-idx="${i}"></div>`;
      }

      this.$dotsWrap.innerHTML = '';
      this.$dotsWrap.insertAdjacentHTML('beforeend', dotsHtml);
      this.$dotList = this.$dotsWrap.querySelectorAll('[data-dot]');
    });

    _defineProperty(this, "setDisplaySlides", () => {
      if (!this.breakingPoints) {
        this.displaySlides = 1;
        return;
      }

      const widthWindow = document.documentElement.scrollWidth;

      if (this.breakingPoints.four.width <= widthWindow) {
        if (this.displaySlides == this.breakingPoints.four.count) {
          return;
        }

        this.displaySlides = this.breakingPoints.four.count;
        this.createDotList();
        return;
      }

      if (this.breakingPoints.three.width <= widthWindow) {
        if (this.displaySlides == this.breakingPoints.three.count) {
          return;
        }

        this.displaySlides = this.breakingPoints.three.count;
        this.createDotList();
        return;
      }

      if (this.breakingPoints.two.width <= widthWindow) {
        if (this.displaySlides == this.breakingPoints.two.count) {
          return;
        }

        if (this.displaySlides == this.breakingPoints.one.count) {
          return;
        }

        this.displaySlides = this.breakingPoints.two.count;
        this.createDotList();
        return;
      }

      this.displaySlides = this.breakingPoints.one.count;
      this.createDotList();
    });

    _defineProperty(this, "listener", () => {
      const setFirstSlide = this.debaunce.debaunce(this.setFirstSlide, 200);
      window.addEventListener('resize', setFirstSlide);
      this.$track.addEventListener('touchstart', e => {
        this.startTouchMove(e);
      });
      this.$track.addEventListener('touchmove', e => {
        this.touchMove(e);
      });
      this.$track.addEventListener('touchend', () => {
        this.touchEnd();
      });

      if (this.breakingPoints) {
        const setDisplaySlides = this.debaunce.debaunce(this.setDisplaySlides, 200);
        window.addEventListener('resize', setDisplaySlides);
      }
    });

    this.$slider = document.querySelector(sliderId);
    this.breakingPoints = breakingPoints;
    this.debaunce = new Debaunce();
    this.init();
  }

  init() {
    if (!this.$slider) {
      return;
    }

    this.i = 0;
    this.$track = this.$slider.querySelector('[data-slider-track]');
    this.$slides = this.$slider.querySelectorAll('[data-slide]');
    this.quantitySlides = this.$slides.length;
    this.slideWidth = this.$slides[0].offsetWidth;
    this.$prevBtn = this.$slider.querySelector('[data-prev]');
    this.$nextBtn = this.$slider.querySelector('[data-next]');
    this.$dotPicTrack = this.$slider.querySelector('[data-pic-dot-track]');
    this.$dotsPicWrap = this.$slider.querySelector('[data-pic-dots]');
    this.$dotPicList = this.$slider.querySelectorAll('[data-pic-dot]');
    this.$dotsWrap = this.$slider.querySelector('[data-dots-wrap]');
    this.displaySlides;
    this.activeDotPic = 1;
    this.touchStart = 0;
    this.touchPosition = 0;
    this.sensitivity = 30;
    this.navigation();
    this.listener();
    this.setDisplaySlides();
    this.$dotList = this.$slider.querySelectorAll('[data-dot]');
  }

}

class Sidebar {
  constructor(sidebarId) {
    _defineProperty(this, "init", () => {
      if (!this.sidebar) {
        return;
      }

      this.sidebarList = this.sidebar.querySelector('[data-list-id]');
      this.render = new Render(this.sidebarList);
      this.server = new Server();
      this.createNav();
    });

    _defineProperty(this, "createNav", async () => {
      const listId = this.sidebarList.dataset.listId;
      this.render.renderSpiner('Идет загрузка...');
      const response = await this.server.getMenu(listId);

      if (response.rez == 0) {
        this.render.renderErrorMsg(response.error.desc);
        console.log(`Ошибка: ${response.error.id}`);
      }

      if (response.rez == 1) {
        const menuList = response.content;
        this.render.delete('[data-spinner]');
        this.render.renderMenu(menuList);
      }
    });

    this.sidebar = doc.querySelector(sidebarId);
    this.init();
  }

}

class SearchModal extends Modal {
  constructor(modalId) {
    super(modalId);

    _defineProperty(this, "init", () => {
      if (!this.$modal) {
        return false;
      }

      this.$searchArea = this.getElement('#searchArea');
      this.$areaListBody = this.getElement('#areaListBody');
      this.$areaList = this.getElement('#areaList');
      this.$areaName = this.getElement('#areaName');
      this.$input = this.getElement('#searchInput');
      this.$content = this.getElement('[data-content]');
      this.$spinnerWrap = this.getElement('[data-spinner-wrap]');
      this.value = '';
      this.area = '';
      this.renderSpinner = new Render(this.$spinnerWrap);
      this.render = new Render(this.$content);
      this.debaunce = new Debaunce();
      this.searchAreaListener();
      this.searchModalListener();
      this.searchInputListener();
    });

    _defineProperty(this, "openSearch", () => {
      this.open();

      if (!this.$content.children.length) {
        this.render.clearParent();
        this.showSpinner();
        this.createContent();
      }
    });

    _defineProperty(this, "slideToggleAreaList", () => {
      const isClose = this.$areaListBody.dataset.isClose;

      if (isClose === 'close') {
        this.openAreaList();
      }

      if (isClose === 'open') {
        this.closeAreaList();
      }
    });

    _defineProperty(this, "openAreaList", () => {
      const areaListHeight = this.$areaList.offsetHeight;
      this.$areaListBody.style.height = areaListHeight + 'px';
      setTimeout(() => {
        this.$areaListBody.dataset.isClose = 'open';
      }, 200);
    });

    _defineProperty(this, "closeAreaList", () => {
      this.$areaListBody.dataset.isClose = 'close';
      this.$areaListBody.style.height = 0 + 'px';
    });

    _defineProperty(this, "setAreaName", radio => {
      const $radio = radio;
      const area = $radio.dataset.area;
      this.$areaName.innerHTML = area;
      this.area = $radio.value;
    });

    _defineProperty(this, "createContent", async () => {
      const response = await this.getContent();

      if (!response.rez) {
        this.renderSpinner.renderErrorMsg(response.error.desc);
        console.log('Ошибка: ' + response.error.id);
      }

      if (response.rez) {
        this.hideSpinner();
        this.render.clearParent();
        this.render.renderSearchContent(response);
      }
    });

    _defineProperty(this, "getContent", () => {
      const data = {
        products: 0,
        caregory: 0,
        news: 0,
        value: this.value
      };

      if (this.area === '') {
        data.products = 6;
        data.category = 4;
        data.news = 0;
        return this.server.getSearchContent(data);
      }

      if (this.area === 'products') {
        data.products = 8;
        data.category = 0;
        data.news = 0;
        return this.server.getSearchContent(data);
      }

      if (this.area === 'categoty') {
        data.products = 0;
        data.category = 8;
        data.news = 0;
        return this.server.getSearchContent(data);
      }

      if (this.area === 'news') {
        data.products = 0;
        data.category = 0;
        data.news = 8;
        return this.server.getSearchContent(data);
      }
    });

    _defineProperty(this, "sendingSearchQuery", () => {
      this.value = this.$input.value;
      this.hideSpinner();
      this.showSpinner();
      this.createContent();
    });

    _defineProperty(this, "showSpinner", () => {
      if (this.$spinnerWrap.classList.contains('modal-search__spinner--is-show')) {
        return;
      }
      this.$spinnerWrap.classList.add('modal-search__spinner--is-show');
      this.renderSpinner.renderSpiner('Идет загрузка...');
    });

    _defineProperty(this, "hideSpinner", () => {
      this.renderSpinner.delete('[data-spinner]');
      this.$spinnerWrap.classList.remove('modal-search__spinner--is-show');
    });

    _defineProperty(this, "searchInputListener", () => {
      const sendingSearchQuery = this.debaunce.debaunce(this.sendingSearchQuery, 200);
      this.$input.addEventListener('input', sendingSearchQuery);
    });

    _defineProperty(this, "searchAreaListener", () => {
      if (!this.$searchArea) {
        return false;
      }

      this.$searchArea.addEventListener('click', this.slideToggleAreaList);
    });

    _defineProperty(this, "searchModalListener", () => {
      this.$modal.addEventListener('click', e => {
        //const target = e.target;
        if (this.$areaListBody.dataset.isClose === 'open') {
          this.closeAreaList();
        }
      });
      this.$modal.addEventListener('change', e => {
        const target = e.target;

        if (target.closest('[name="type"]')) {
          this.setAreaName(target);
        }
      });
    });

    this.init();
  }

}

class CityModal extends Modal {
  constructor(modalId) {
    super(modalId);

    _defineProperty(this, "initCityModal", () => {
      if (!this.$modal) {
        return;
      }

      this.$searchCityInput = this.getElement('#searchCityInput');
      this.$cityList = this.getElement('#cityList');
      this.render = new Render(this.$cityList);
      this.debaunce = new Debaunce();
      this.regionList = null;
      this.$listItem = null;
      this.inputValue = '';
      this.isHasRegionList = false;
      this.numCol = 1;
      this.changingSizeWindow();
      this.searchCityInputListener();
    });

    _defineProperty(this, "changingSizeWindow", () => {
      const setNubColumns = this.debaunce.debaunce(this.setNubColumns, 300);
      window.addEventListener('resize', setNubColumns);
    });

    _defineProperty(this, "setNubColumns", () => {
      let lientWidth = doc.documentElement.clientWidth;

      if (lientWidth < 500) {
        this.numCol = 1;

        if (this.numCol === this.getColl()) {
          return;
        }

        this.render.renderListCity(this.regionList, this.numCol);
        return;
      }

      if (lientWidth < 750) {
        this.numCol = 2;

        if (this.numCol === this.getColl()) {
          return;
        }

        this.render.renderListCity(this.regionList, this.numCol);
        return;
      }

      if (lientWidth < 900) {
        this.numCol = 3;

        if (this.numCol === this.getColl()) {
          return;
        }

        this.render.renderListCity(this.regionList, this.numCol);
        return;
      }

      if (lientWidth > 900) {
        this.numCol = 4;

        if (this.numCol === this.getColl()) {
          return;
        }

        this.render.renderListCity(this.regionList, this.numCol);
        return;
      }
    });

    _defineProperty(this, "openCityModal", async () => {
      this.open();

      if (this.isHasRegionList) {
        return;
      }

      if (!this.isHasRegionList) {
        this.render.clearParent();
        this.render.renderSpiner('Идет загрузка...');
        await this.createListCity();
      }
    });

    _defineProperty(this, "createListCity", async () => {
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
    });

    _defineProperty(this, "searchCity", () => {
      this.changeInputValue();
      this.showFindedRegeon();
      this.showFindedCity();
      this.openFindedRegeon();
    });

    _defineProperty(this, "changeInputValue", () => {
      this.inputValue = this.$searchCityInput.value.trim().toLowerCase();
    });

    _defineProperty(this, "showFindedRegeon", () => {
      if (this.inputValue == '') {
        this.setNubColumns();
        this.render.renderListCity(this.regionList, this.numCol);
        return;
      }

      if (this.inputValue != '') {
        const newRegionList = this.getNewArrRegeon();
        this.setNubColumns();
        this.render.renderListCity(newRegionList, this.numCol);
      }
    });

    _defineProperty(this, "getNewArrRegeon", () => {
      const newRegionList = [];
      this.regionList.forEach(regeon => {
        const res = this.checkRegeon(regeon);

        if (res) {
          newRegionList.push(regeon);
        }
      });
      return newRegionList;
    });

    _defineProperty(this, "checkRegeon", regeon => {
      const regionName = regeon.title;
      const listCity = regeon.parent;
      let rez = false;
      rez = regionName.toLowerCase().includes(this.inputValue);
      listCity.forEach(city => {
        rez = rez || city.title.toLowerCase().includes(this.inputValue);
      });
      return rez;
    });

    _defineProperty(this, "getColl", () => {
      if (!this.$cityList) {
        return;
      }

      return this.$cityList.querySelectorAll('.city-list__col').length;
    });

    _defineProperty(this, "showAllCity", $cities => {//let rez = true;
      //$cities.forEach(($city) => {
      //  res = rez && $city.classList.has('city-hide');
      //  console.log()
      //})
    });

    _defineProperty(this, "searchCityInputListener", () => {
      const searchCity = this.debaunce.debaunce(this.searchCity, 500);

      if (!this.$searchCityInput) {
        return false;
      }

      this.$searchCityInput.addEventListener('input', searchCity);
    });

    this.initCityModal();
  }

  showFindedCity() {
    const $allRegionItems = this.getElement('[data-region-item]', true);
    $allRegionItems.forEach($item => {
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

    if (this.inputValue.trim() === '') {
      return;
    }

    $allCityList.forEach($cityList => {
      const $dropdownBody = $cityList.querySelector('[data-dropdown-close]');
      const $arrow = $cityList.querySelector('[data-dropdown-arrow]');
      const $cities = $cityList.querySelectorAll('[data-region-item]');
      this.showAllCity($cities);
      openDropdown($dropdownBody, false, $arrow);
    });
  }

  showCity($item) {
    $item.classList.remove('city-hide');
  }

  hideCity($item) {
    $item.classList.add('city-hide');
  }

}

class FastOrderModal extends Modal {
  constructor(modalId) {
    super(modalId);

    _defineProperty(this, "init", () => {
      if (!this.$modal) {
        return;
      }

      this.$productModal = this.$modal.querySelector('[data-modal-wrap]');
      this.server = new Server();
      this.render = new Render(this.$productModal);
      this.listener();
    });

    _defineProperty(this, "openFastOrder", async $btn => {
      this.$btn = $btn;
      this.open();
      this.render.clearParent();
      this.render.renderSpiner('Идет загрузка...');
      await this.createModalCard();
      this.$input = this.$modal.querySelector('[data-modal-input]');
      this.$totalPrice = this.$modal.querySelector('[data-modal-total]');
    });

    _defineProperty(this, "getProduct", async (count = 1) => {
      const $productCard = this.$btn.closest('[data-product-card]');
      const id = $productCard.dataset.id;
      return await this.server.getFastOrderProduct({
        id: id,
        count: count
      });
    });

    _defineProperty(this, "createModalCard", async () => {
      const response = await this.getProduct();

      if (!response.rez) {
        this.render.renderErrorMsg(response.error.desc);
        console.log(`Ошибка: ${response.error.id}`);
      }

      if (response.rez) {
        this.render.delete('[data-spinner]');
        this.render.renderModalCard(response.content);
      }
    });

    _defineProperty(this, "counter", eTarget => {
      const $btn = eTarget.closest('[data-modal-btn]');

      if ($btn.dataset.modalBtn === 'inc') {
        this.inc();
      }

      if ($btn.dataset.modalBtn === 'dec') {
        this.dec();
      }
    });

    _defineProperty(this, "inc", async () => {
      const count = parseInt(this.$input.value) + 1;
      const response = await this.getProduct(count);
      this.sentCountAndTotalPrice(response.content[0]);
    });

    _defineProperty(this, "dec", async () => {
      const count = parseInt(this.$input.value) - 1;

      if (count <= 0) {
        this.$input.value = 1;
        return;
      }

      const response = await this.getProduct(count);
      this.sentCountAndTotalPrice(response.content[0]);
    });

    _defineProperty(this, "changingValue", async () => {
      const count = this.checkCount(this.$input.value);
      const response = await this.getProduct(count);
      this.sentCountAndTotalPrice(response.content[0]);
    });

    _defineProperty(this, "checkCount", count => {
      let value = parseInt(count);

      if (count <= 0) {
        value = 1;
      }

      if (isNaN(value)) {
        value = 1;
      }

      return value;
    });

    _defineProperty(this, "sentCountAndTotalPrice", card => {
      this.$input.value = card.count;
      this.$totalPrice.innerHTML = card.total_price;
    });

    _defineProperty(this, "listener", () => {
      this.$modal.addEventListener('click', e => {
        if (e.target.closest('[data-modal-btn]')) {
          this.counter(e.target);
        }
      });
      this.$modal.addEventListener('input', e => {
        if (e.target.closest('[data-modal-input]')) {
          this.changingValue();
        }
      });
    });

    this.init();
  }

}

class ConsultationModal extends Modal {
  constructor(modalId) {
    super(modalId);
  }

}

class InfoModal {
  constructor(modalId) {
    _defineProperty(this, "init", () => {
      if (!this.$modal) {
        return;
      }

      this.productId = null;
      this.$modalInfo = this.$modal.querySelector('[data-info]');
      this.$productCard = null;
      this.response = null;
      this.server = new Server();
      this.render = new Render(this.$modalInfo);
      this.timeOut = null;
      this.closeModal();
    });

    _defineProperty(this, "open", $productCard => {
      if (this.$modal.dataset.add === 'open') {
        clearTimeout(this.timeOut);
      }

      this.timeOut = setTimeout(() => {
        this.close();
      }, 3000);
      this.$modal.classList.add('add-modal--is-open');
      this.$productCard = $productCard;
      this.productId = $productCard.dataset.id;
      this.$modal.dataset.add = 'open';
    });

    _defineProperty(this, "close", () => {
      clearTimeout(this.timeOut);
      this.$modal.classList.remove('add-modal--is-open');
      this.$modal.dataset.add = 'close';
    });

    _defineProperty(this, "closeModal", () => {
      if (!this.$modal) {
        return;
      }

      this.$modal.addEventListener('click', e => {
        const $elTarget = e.target;

        if ($elTarget.hasAttribute('data-close')) {
          this.close();
          return true;
        }
      });
    });

    _defineProperty(this, "showSpinner", () => {
      this.render.clearParent();
      this.render.renderSpiner();
    });

    _defineProperty(this, "showError", error => {
      this.render.renderErrorMsg(error.desc);
      console.log(`Ошибка: ${error.id}`);
    });

    this.$modal = doc.querySelector(modalId);
    this.init();
  }

}

class AddFavoriteModal extends InfoModal {
  constructor(modalId) {
    super(modalId);

    _defineProperty(this, "init", () => {
      if (!this.$productCard && !this.$modal) {
        return;
      }

      this.$favoriteCount = doc.querySelector('#favoriteCount');
    });

    _defineProperty(this, "openModal", $productCard => {
      this.open($productCard);
      this.init();
      this.renderInfo();
    });

    _defineProperty(this, "renderInfo", async () => {
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
    });

    _defineProperty(this, "add", () => {
      this.render.renderAddInfo('favorite', this.response.favorite);
      const $productList = this.getProductList();
      $productList.forEach(item => {
        this.addActiveClass(item);
      });

      if (this.$favoriteCount) {
        this.$favoriteCount.innerHTML = this.response.favorite.count;
      }
    });

    _defineProperty(this, "addActiveClass", item => {
      const changeEl = this.getChangeEl(item);

      if (changeEl.$stiker) {
        changeEl.$stiker.classList.add('product-card__stiker-icon--is-active');
      }

      if (changeEl.$icon) {
        changeEl.$icon.classList.add('favorite__icon--is-active');
      }

      if (changeEl.$addText) {
        changeEl.$addText.innerHTML = 'удалить из Избранное';
      }
    });

    _defineProperty(this, "remove", () => {
      this.render.renderDeleteInfo('favorite', this.response.favorite);
      const $productList = this.getProductList();
      $productList.forEach(item => {
        this.addActiveClass(item);
      });

      if (this.$favoriteCount) {
        this.$favoriteCount.innerHTML = this.response.favorite.count;
      }
    });

    _defineProperty(this, "removeActiveClass", item => {
      const changeEl = this.getChangeEl(item);

      if (changeEl.$stiker) {
        changeEl.$stiker.classList.remove('product-card__stiker-icon--is-active');
      }

      if (changeEl.$icon) {
        changeEl.$icon.classList.remove('favorite__icon--is-active');
      }

      if (changeEl.$addText) {
        changeEl.$addText.innerHTML = 'удалить из Избранное';
      }
    });

    _defineProperty(this, "getChangeEl", item => {
      return {
        $stiker: item.querySelector('[data-sticer-favirite]'),
        $icon: item.querySelector('[data-icon-favorite]'),
        $addText: item.querySelector('[data-add-favorite-text]')
      };
    });

    _defineProperty(this, "getProductList", () => {
      const id = this.response.content[0].id;
      return doc.querySelectorAll(`[data-id="${id}"]`);
    });
  }

}

class AddBasketModal extends InfoModal {
  constructor(modalId) {
    super(modalId);

    _defineProperty(this, "init", () => {
      if (!this.$productCard && !this.$modal) {
        return;
      }

      this.$btn = null;
      this.$basketCount = null;
      this.$input = null;
    });

    _defineProperty(this, "openModal", $productCard => {
      this.open($productCard);
      this.$btn = this.$productCard.querySelector('[data-add-basket]');
      this.$basketCount = doc.querySelector('#basketCount');
      this.$input = this.$productCard.querySelector('[data-counter-input]');
      this.renderInfo();
    });

    _defineProperty(this, "renderInfo", async () => {
      this.showSpinner();
      this.response = await this.server.addBsasket(this.productId);

      if (!this.response.rez) {
        this.showError(this.response.error);
      }

      if (this.response.rez) {
        this.render.delete('[data-spinner]');
        basket.addInBasket(this.response);

        if (this.response.toggle) {
          this.add();
        }

        if (!this.response.toggle) {
          this.remove();
        }
      }
    });

    _defineProperty(this, "add", () => {
      this.render.renderAddInfo('basket', this.response.card);

      if (this.$basketCount) {
        this.$basketCount.innerHTML = this.response.card.count;
      }

      this.$btn.classList.remove('red-btn');
      this.$btn.classList.add('red-btn-bd');
      this.$btn.innerHTML = 'В карзине';
      this.$input.value = this.response.content[0].count;
      this.$productCard.dataset.inBasket = '1';
    });

    _defineProperty(this, "remove", () => {
      this.render.renderDeleteInfo('basket', this.response.card);

      if (this.$basketCount) {
        this.$basketCount = this.response.card.count;
      }

      this.$btn.classList.add('red-btn');
      this.$btn.classList.remove('red-btn-bd');
      this.$btn.innerHTML = 'Заказать';
      this.$productCard.dataset.inBasket = '0';
    });

    this.init();
  }

}

class Form {
  constructor(formId) {
    _defineProperty(this, "formInit", () => {
      if (!this.$form) {
        return false;
      }

      this.$inputs = this.$form.querySelectorAll('[data-input]');
      this.$formMsg = this.$form.querySelector('[data-form-msg]');
      this.$resultBlock = this.$form.closest('[data-form]').querySelector('[data-result]');
      this.response = null;
      this.server = new Server();
    });

    _defineProperty(this, "formCheck", (...$inputs) => {
      let res = true;
      $inputs.forEach(item => {
        res = this.checkInput(item) && res;
      });

      if (!res) {
        console.log('not sent');
        return res;
      }

      if (res) {
        console.log('sent');
        return res;
      }
    });

    _defineProperty(this, "checkInput", $input => {
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
    });

    _defineProperty(this, "statusVisualInput", ($input, result) => {
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
        //if (value === '') {
        //  $inputMsg.innerHTML = 'Обязательное поле';
        //} else {
        //  $inputMsg.innerHTML = 'Ошибка заполнения';
        //}
        $inputMsg.classList.add('placeholder--is-error');
        $inputBlock.classList.add('input--is-error');
        return false;
      }
    });

    _defineProperty(this, "sendForm", async () => {
      this.response = await this.server.postForm(this.$form);

      if (!this.response.rez) {
        this.resultBlockHide();
        this.showErrorMessage(this.response.error);
      }

      if (this.response.rez) {
        this.clearForm();
        this.resultBlockShow();
      }
    });

    _defineProperty(this, "showErrorMessage", errorInfo => {
      this.$formMsg.classList.add('form__message--is-show');
      this.$formMsg.innerHTML = errorInfo.desc;
      console.log(`Ошибка: ${errorInfo.id}`);
    });

    _defineProperty(this, "resultBlockShow", () => {
      if (!this.$resultBlock) {
        return;
      }

      this.$resultBlock.classList.add('result--is-show');
    });

    _defineProperty(this, "resultBlockHide", () => {
      if (!this.$resultBlock) {
        return;
      }

      this.$resultBlock.classList.remove('result--is-show');
    });

    _defineProperty(this, "clearForm", () => {
      this.$inputs.forEach($item => {
        $item.value = '';
      });

      if (this.$textarea) {
        this.$textarea.value = '';
      }

      this.$formMsg.classList.remove('form__message--is-show');
      this.$formMsg.innerHTML = '';
    });

    this.$form = doc.querySelector(formId);
    this.regTel = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{5,10}$/;
    this.regMail = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/;
    this.formInit();
  }

  checkValue(value, reg) {
    return reg.test(value);
  }

  checkCheckbox(checkbox) {
    return checkbox.checked;
  }

  statusVisualCheckbox($checkbox, result = false) {
    const $checkboxBlock = $checkbox.closest('[data-checkbox-block]');

    if (!result) {
      $checkboxBlock.classList.add('animation-shake');
      setTimeout(() => {
        $checkboxBlock.classList.remove('animation-shake');
      }, 800);
      return;
    }
  }

}

class CallBackForm extends Form {
  constructor(formId) {
    super(formId);

    _defineProperty(this, "initCallbackForm", () => {
      if (!this.$form) {
        return false;
      }

      this.$checkbox = this.$form.querySelector('[data-checkbox]');
      this.$submitBtn = this.$form.querySelector('[data-submit]');
      this.$inputPhone = this.$form.querySelector('[name="phone"]');
      this.listeners();
      this.send();
    });

    _defineProperty(this, "send", () => {
      this.$submitBtn.addEventListener('click', () => {
        const result = this.formCheck(this.$inputPhone, this.$checkbox);

        if (result) {
          this.sendForm();
        }
      });
    });

    _defineProperty(this, "listeners", () => {
      this.$inputPhone.addEventListener('blur', () => {
        this.checkInput(this.$inputPhone);
      });
    });

    this.initCallbackForm();
  }

}

class FastOrdenForm extends Form {
  constructor(formId) {
    super(formId);

    _defineProperty(this, "initFastOrderForm", () => {
      if (!this.$form) {
        return false;
      }

      this.$checkbox = this.$form.querySelector('[data-checkbox]');
      this.$submitBtn = this.$form.querySelector('[data-submit]');
      this.$inputPhone = this.$form.querySelector('[name="phone"]');
      this.$inputMail = this.$form.querySelector('[name="email"]');
      this.listeners();
      this.send();
    });

    _defineProperty(this, "send", () => {
      this.$submitBtn.addEventListener('click', () => {
        const result = this.formCheck(this.$inputPhone, this.$inputMail, this.$checkbox);

        if (result) {
          this.sendForm();
        }
      });
    });

    _defineProperty(this, "listeners", () => {
      this.$inputPhone.addEventListener('blur', () => {
        this.checkInput(this.$inputPhone);
      });
      this.$inputMail.addEventListener('blur', () => {
        this.checkInput(this.$inputMail);
      });
    });

    this.initFastOrderForm();
  }

}

class FeedBackForm extends Form {
  constructor(formId) {
    super(formId);

    _defineProperty(this, "initFeedBackForm", () => {
      if (!this.$form) {
        return false;
      }

      this.$checkbox = this.$form.querySelector('[data-checkbox]');
      this.$submitBtn = this.$form.querySelector('[data-submit]');
      this.$inputPhone = this.$form.querySelector('[name="phone"]');
      this.$inputMail = this.$form.querySelector('[name="email"]');
      this.listeners();
      this.send();
    });

    _defineProperty(this, "send", () => {
      this.$submitBtn.addEventListener('click', () => {
        const result = this.formCheck(this.$inputPhone, this.$inputMail, this.$checkbox);
        this.resultBlockHide();

        if (result) {
          this.sendForm();
        }
      });
    });

    _defineProperty(this, "listeners", () => {
      this.$inputPhone.addEventListener('blur', () => {
        this.checkInput(this.$inputPhone);
      });
      this.$inputMail.addEventListener('blur', () => {
        this.checkInput(this.$inputMail);
      });
    });

    this.initFeedBackForm();
  }

}

class BasketForm extends Form {
  constructor(formId) {
    super(formId);

    _defineProperty(this, "initBasketForm", () => {
      if (!this.$form) {
        return false;
      }

      this.$checkbox = this.$form.querySelector('[data-checkbox]');
      this.$submitBtn = this.$form.querySelector('[data-submit]');
      this.$inputPhone = this.$form.querySelector('[name="phone"]');
      this.$inputMail = this.$form.querySelector('[name="email"]');
      this.$basketList = doc.querySelector('#basketList');
      this.listeners();
      this.send();
    });

    _defineProperty(this, "send", () => {
      this.$submitBtn.addEventListener('click', () => {
        const result = this.formCheck(this.$inputPhone, this.$inputMail, this.$checkbox);
        this.resultBlockHide();

        if (result) {
          this.sendForm();
        }
      });
    });

    _defineProperty(this, "listeners", () => {
      this.$inputPhone.addEventListener('blur', () => {
        this.checkInput(this.$inputPhone);
      });
      this.$inputMail.addEventListener('blur', () => {
        this.checkInput(this.$inputMail);
      });
    });

    _defineProperty(this, "sendForm", async () => {
      this.response = await this.server.postForm(this.$form);

      if (!this.response.rez) {
        this.resultBlockHide();
        this.showErrorMessage(this.response.error);
      }

      if (this.response.rez) {
        this.clearForm();
        this.resultBlockShow();

        if (this.$basketList) {
          this.$basketList.innerHTML = '<p data-empty>Корзина пустая</p>';
        }
      }
    });

    this.initBasketForm();
  }

} // формы


const callBackForm = new CallBackForm('#callBackForm');
const fastOrdenForm = new FastOrdenForm('#fastOrdenForm');
const feedBackForm = new FeedBackForm('#feedBackForm');
const basketForm = new BasketForm('#basketForm');
const render = new Render();
const server = new Server(); // окна

const searchModal = new SearchModal('#searchModal');
const cityModal = new CityModal('#cityModal');
const callBackModal = new CityModal('#callBackModal');
const fastOrderModal = new FastOrderModal('#fastOrdenModal');
const consultationModal = new ConsultationModal('#consultationModal');
const addFavoriteModal = new AddFavoriteModal('#addFavoriteModal', 'favorite');
const addBasketModal = new AddBasketModal('#addBasketModal', 'basket');
const filters = new Filters('#filters');
const mobiliMenu = new MobileMenu('#mobileMenu');
const basket = new Basket('#basket');
const productSlider = new Slider('#productSlider');
const breakingPoints = {
  one: {
    width: 0,
    count: 1
  },
  two: {
    width: 700,
    count: 2
  },
  three: {
    width: 1000,
    count: 3
  },
  four: {
    width: 1472,
    count: 4
  }
};
const sliderOne = new Slider('#sliderOne', breakingPoints);
const sliderTwo = new Slider('#sliderTwo', breakingPoints);
const sidebar = new Sidebar('#sidebar');
doc.addEventListener('click', docClickListener);
doc.addEventListener('input', docInputListener);

if ($popupList.length) {
  createPopupNav();
} //modals
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
} //окно города


if ($openCityModalBtn && $cityModal) {
  $openCityModalBtn.addEventListener('click', () => {
    cityModal.openCityModal();
  });
}

if ($openCityModalMobileBtn && $cityModal) {
  $openCityModalMobileBtn.addEventListener('click', () => {
    cityModal.openCityModal();
  });
} //callBackModal


if ($openCallBackModalBtn && $callBackModal) {
  $openCallBackModalBtn.addEventListener('click', () => {
    callBackModal.open();
  });
}

if ($openCallBackModalMobileBtn && $callBackModal) {
  $openCallBackModalMobileBtn.addEventListener('click', () => {
    callBackModal.open();
  });
}

if ($mobileMenuBtn && $mobileMenu) {
  $mobileMenuBtn.addEventListener('click', () => {
    mobiliMenu.open();
  });
} // Forms


if ($callBackForm) {
  $callBackForm.addEventListener('submit', e => {
    e.preventDefault();
  });
}

if ($fastOrdenForm) {
  $fastOrdenForm.addEventListener('submit', e => {
    e.preventDefault();
  });
}

if ($feedBackForm) {
  $feedBackForm.addEventListener('submit', e => {
    e.preventDefault();
  });
}

if ($basketForm) {
  $basketForm.addEventListener('submit', e => {
    e.preventDefault();
  });
}

if ($morePropWrap) {
  $showPropBtn.addEventListener('click', togglePropMoreList);
}

if ($filters) {
  $filterBtn.addEventListener('click', openFilter);
  $filters.addEventListener('click', e => {
    if (e.target.hasAttribute('data-close')) {
      closeFilter();
    }
  });
}

function openFilter() {
  $filters.classList.add('filters-is-show');
}

function closeFilter() {
  $filters.classList.remove('filters-is-show');
}

if ($map) {
  yandexMap();
}

function togglePropMoreList() {
  const status = $morePropWrap.dataset.status;

  if (status === "close") {
    openPropMoreList();
  }

  if (status === "open") {
    closePropMoreList();
  }
}

function openPropMoreList() {
  const heightPropMore = $propMore.offsetHeight;
  const btnText = 'Свернуть характеристики';
  $morePropWrap.style.height = heightPropMore + 30 + 'px';
  setTimeout(() => {
    $morePropWrap.classList.add('properties__more--is-show');
  }, 300);
  $showPropBtn.innerText = btnText;
  $morePropWrap.dataset.status = 'open';
}

function closePropMoreList() {
  const btnText = 'Все характеристики';
  $morePropWrap.style.height = '0px';
  $showPropBtn.innerText = btnText;
  $morePropWrap.classList.remove('properties__more--is-show');
  $morePropWrap.dataset.status = 'close';
}

function toggleDropdown(target) {
  //if (target.closest('[data-dropdown-list]')) {
  //  return;
  //}
  const $dropdownBody = getDropdownEl(target, '[data-dropdown-close]');
  const $arrow = getDropdownEl(target, '[data-dropdown-arrow]');
  const isClose = $dropdownBody.dataset.dropdownClose;
  const $dropdownHeader = getDropdownEl(target, '[data-dropdown-header]');

  if (isClose == 'close') {
    openDropdown($dropdownBody, $dropdownHeader, $arrow);
  }

  if (isClose == 'open') {
    closeDropdown($dropdownBody, $dropdownHeader, $arrow);
  }
}

function getDropdownEl(target, selector) {
  const $dropdown = target.closest('[data-dropdown]');
  return $dropdown.querySelector(selector);
}

async function openDropdown($dropdownBody, $dropdownHeader, $arrow) {
  const $dropdown = $dropdownBody.closest('[data-dropdown]');
  const $listId = $dropdown.querySelector('[data-list-id]');
  const $dropdownList = $dropdownBody.querySelector('[data-dropdown-list]');

  if ($listId) {
    await createSubmenu($listId.dataset.listId, $dropdownList);
  }

  const dropdownListHeight = $dropdownList.offsetHeight;
  $dropdownBody.style.height = dropdownListHeight + 'px';

  if ($dropdownHeader) {
    $dropdown.classList.add('bg-pearl');
    $dropdownHeader.classList.add('dropdown-header--is-active');
  }

  $arrow.classList.add('dropdown__arrow--is-down');
  $dropdownBody.dataset.dropdownClose = 'open';
}

function closeDropdown($dropdownBody, $dropdownHeader, $arrow) {
  $dropdownBody.style.height = 0 + 'px';
  $arrow.classList.remove('dropdown__arrow--is-down');
  $dropdownBody.dataset.dropdownClose = 'close';

  if ($dropdownHeader) {
    $dropdownBody.closest('[data-dropdown]').classList.remove('bg-pearl');
    $dropdownHeader.classList.remove('dropdown-header--is-active');
  }
}

async function createSubmenu(id, $ul) {
  if ($ul.firstElementChild) {
    return;
  }

  const response = await server.getMenu(id);

  render._render($ul, render.getSubmenuHtml, response.content);
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

  if ($productCard.dataset.inBasket === "1") {
    return;
  }

  if ($productCard) addBasketModal.openModal($productCard);

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

function createPopupNav() {
  $popupList.forEach($item => {
    renderPopupNav($item);
  });
}

async function renderPopupNav($item) {
  const id = $item.dataset.popupId;
  const response = await server.getMenu(id);

  if (response.rez == 0) {
    render.renderErrorMsg(response.error.desc, $item);
  }

  if (response.rez == 1) {
    render.renderMenu(response.content, $item);
  }
}

function docClickListener(e) {
  const target = e.target;

  if (target.closest('[data-fast-order]')) {
    fastOrderModal.openFastOrder(target);
  }

  if (target.closest('[data-dropdown-btn]')) {
    toggleDropdown(target);
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

  if ($selects.length) {
    if (target.closest('[data-select-btn]')) {
      toggleSelect(target);
    }

    if (!target.closest('[data-select-btn]')) {
      closeAllSelect();
    }
  }
}

function closeAllSelect() {
  $selects.forEach($select => {
    const selectEls = getSelectEls($select);
    closeSelect(selectEls);
  });
}

function toggleSelect(target) {
  const $select = target.closest('[data-select]');
  const selectEls = getSelectEls($select);
  const status = $select.dataset.select;

  if (status === 'close') {
    closeAllSelect();
    openSelect(selectEls);
  }

  if (status === 'open') {
    closeSelect(selectEls);
  }
}

function openSelect(selectEls) {
  selectEls.$body.style.height = '270px';
  selectEls.$select.dataset.select = 'open';
  selectEls.$select.classList.add('select--is-active');
}

function closeSelect(selectEls) {
  selectEls.$body.style.height = '0px';
  selectEls.$select.dataset.select = 'close';
  selectEls.$select.classList.remove('select--is-active');
}

function getSelectEls($select) {
  return {
    $select: $select,
    $body: $select.querySelector('[data-body]')
  };
}

function docInputListener(e) {
  const target = e.target;

  if (target.closest('[data-counter-input]')) {
    changingValue(target);
  }
}

function docChangListener(e) {
  const target = e.target;

  if (target.closest('[data-counter-input]')) {
    changingValue(target);
  }
} // Функции счетчика товаров


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
  const $card = $btn.closest('[data-product-card]');
  const cardInfo = getCardInfo($card);
  const $cardList = getCardList(cardInfo.id);
  const value = checkCount(cardInfo.$input.value);
  const count = parseInt(value) + 1;

  if (cardInfo.isInBasket === '0') {
    cardInfo.$input.value = count;
  }

  if (cardInfo.isInBasket === '1') {
    const response = await server.addBsasket(cardInfo.id, count);

    if (response.rez) {
      setTotalBasketCount(response.card.count);
      setProductTotalPrice($cardList, response.content[0].total_price);
      basket.setTotalBasket(response.card);
      setInputCardValue($cardList, response.content[0].count);
    }

    if (!response.rez) {
      return;
    }
  }
}

async function dec($btn) {
  const $card = $btn.closest('[data-product-card]');
  const cardInfo = getCardInfo($card);
  const $cardList = getCardList(cardInfo.id);
  const value = checkCount(cardInfo.$input.value);
  const count = parseInt(value) - 1;

  if (cardInfo.isInBasket === '0') {
    if (count < 0) {
      cardInfo.$input.value = 1;
    }

    if (count > 0) {
      cardInfo.$input.value = count;
    }
  }

  if (cardInfo.isInBasket === '1') {
    const response = await server.addBsasket(cardInfo.id, count);

    if (!response.rez) {
      return;
    }

    if (response.rez) {
      setTotalBasketCount(response.card.count);
      setProductTotalPrice($cardList, response.content[0].total_price);
      basket.setTotalBasket(response.card);
      setInputCardValue($cardList, response.content[0].count);
    }
  }
}

async function changingValue(target) {
  const $card = target.closest('[data-product-card]');
  const cardInfo = getCardInfo($card);
  const count = checkCount(cardInfo.$input.value);
  const $cardList = getCardList(cardInfo.id);

  if (cardInfo.isInBasket === '0') {
    cardInfo.$input.value = count;
  }

  if (cardInfo.isInBasket === '1') {
    const response = await server.addBsasket(cardInfo.id, count);

    if (response.rez) {
      setTotalBasketCount(response.card.count);
      setProductTotalPrice($cardList, response.content[0].total_price);
      basket.setTotalBasket(response.card);
      setInputCardValue($cardList, response.content[0].count);
    }

    if (!response.rez) {
      return;
    }
  }
}

function getCardInfo($card) {
  return {
    $input: $card.querySelector('[data-counter-input]'),
    isInBasket: $card.dataset.inBasket,
    id: $card.dataset.id
  };
}

function getCardList(id) {
  return doc.querySelectorAll(`[data-id="${id}"]`);
}

function setInputCardValue($cardList, count) {
  $cardList.forEach($item => {
    const $input = $item.querySelector('[data-counter-input]');
    $input.value = count;
  });
}

function setProductTotalPrice($cardList, price) {
  $cardList.forEach($item => {
    const $totalPrice = $item.querySelector('[data-total-price]');

    if ($totalPrice) {
      $totalPrice.innerHTML = parseInt(price).toLocaleString();
    }
  });
}

function setTotalBasketCount(count) {
  if ($basketCount) {
    $basketCount.innerHTML = count;
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