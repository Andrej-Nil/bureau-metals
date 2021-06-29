'use strict';
const doc = document;
//const $body = document.querySelector('body');
const $openSearchBtn = doc.querySelector('#openSearchBtn');
const $openSearchMobileBtn = doc.querySelector('#openSearchMobileBtn');
const $searchModal = doc.querySelector('#searchModal');

const $cityModal = doc.querySelector('#cityModal')
const $openCityModalBtn = doc.querySelector('#openCityModalBtn')
const $openCityModalMobileBtn = doc.querySelector('#openCityModalMobileBtn');

const $callBackModal = doc.querySelector('#callBackModal')
const $openCallBackModalBtn = doc.querySelector('#openCallBackModalBtn')
const $openCallBackModalMobileBtn = doc.querySelector('#openCallBackModalMobileBtn');

const $consultationModal = doc.querySelector('#consultationModal');

const $map = doc.querySelector('#map');

class Server {
  constructor() {
    this._token = this.getToken();
    this.POST = 'GET';
    this.GET = 'GET';
  }

  getCity = async () => {
    const api = '../json/city.json';
    const data = {
      _token: this._token
    }
    const formData = this.createFormData(data);
    return await this.getResponse(this.POST, formData, api);
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
    this.$body = doc.querySelector('body');
    this.server = new Server();
    this.closeModal();
    this.loading = true;
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
    }, 500)
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
    this.searchAreaListener();
    this.searchModalListener();
  }

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

  searchAreaListener = () => {

    if (!this.$searchArea) {
      return false;
    }
    this.$searchArea.addEventListener('click', this.slideToggleAreaList);
  }

  searchModalListener = () => {
    this.$modal.addEventListener('click', (e) => {
      const $elTarget = e.target;

      if (this.$areaListBody.dataset.isClose === 'open' && !$elTarget.closest('#areaListBody')) {
        this.closeAreaList();
        return true;
      }
    })
  }
}

class CityModal extends Modal {
  constructor(modalId) {
    super(modalId);
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
      this.render.renderListCity(this.regionList, this.numCol);
    });
  }

  setNubColumns = () => {
    let lientWidth = doc.documentElement.clientWidth;

    if (lientWidth < 500) {
      this.numCol = 1;
      return;
    }
    if (lientWidth < 750) {
      this.numCol = 2;
      return;
    }
    if (lientWidth < 900) {
      this.numCol = 3;
      return;
    }
    if (lientWidth > 900) {
      this.numCol = 4;
      return;
    }
  }

  openCityModal = async () => {
    this.open();
    if (this.isHasRegionList) {
      return;
    }
    if (!this.isHasRegionList) {
      this.render.clearParent(this.$cityList);
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
      this.render.renderListCity(this.regionList, this.numCol);
      this.isHasRegionList = response.rez;
    }
  }

  searchCity = () => {
    this.changeInputValue();
    this.showFindedRegeon();
    this.showFindedCity();
    this.openFindedRegeon();
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

    const newRegionList = this.getNewArrRegeon();
    this.setNubColumns();
    this.render.renderListCity(newRegionList, this.numCol);
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
    console.log('test')
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
    this.prodId = null;
    this.$el = null;
    this.server = new Server();
  }

  openFastOrder($el) {
    this.$el = $el;
    this.open();
  }

  getProductId = () => {
    console.log(this.$el);
  }
}

class ConsultationModal extends Modal {
  constructor(modalId) {
    super(modalId);
  }
}

const server = new Server();
const searchModal = new SearchModal('#searchModal');
const cityModal = new CityModal('#cityModal');
const callBackModal = new CityModal('#callBackModal');
const fastOrderModal = new FastOrderModal('#fastOrdenModal');
const consultationModal = new ConsultationModal('#consultationModal');

doc.addEventListener('click', docListener);

//окно поиска
if ($openSearchBtn && $searchModal) {
  $openSearchBtn.addEventListener('click', () => {
    searchModal.open();
  });
}

if ($openSearchMobileBtn && $searchModal) {
  $openSearchMobileBtn.addEventListener('click', () => {
    searchModal.open();
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

if ($map) {
  yandexMap();
}

function docListener(e) {
  const target = e.target;
  if (target.closest('[data-fast-order]')) {
    fastOrderModal.openFastOrder(target);
  }

  if (target.closest('[data-dropdown]')) {
    toggleDropdown(target)
  }
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
