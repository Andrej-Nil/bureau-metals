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

  renderListCity = (regionList, columns = 1) => {
    this.renderColumnsCityList(columns);
    this.renderRegionList(regionList, columns);
  }

  renderColumnsCityList = (columns) => {
    for (let i = 1; i <= columns; i++) {
      this._render(this.$parent, this.getColumnsCityListHtml, false);
    }
  }

  renderRegionList = (regionList, numCol) => {
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
  /*
   <!--<li class="modal-search__region region" data-region data-dropdown>
              <div class="region__header" data-dropdown-btn>
                <i class="region__arrow" data-dropdown-arrow></i>
                <span class="redion__title" data-region-title>Московская область</span>
              </div>
              <div class="region__list-body" data-dropdown-close="close">
                <ul class="region__list" data-dropdown-list>
                  <li class="region__item" data-region-item>
                    <a href="#!" class="region__link link" data-city>
                      Москва
                    </a>
                  </li>

                  <li class="region__item" data-region-item>
                    <a href="#!" class="region__link link" data-city>
                      Орск
                    </a>
                  </li>

                  <li class="region__item" data-region-item>
                    <a href="#!" class="region__link link" data-city>
                      Питер
                    </a>
                  </li>

                  <li class="region__item" data-region-item>
                    <a href="#!" class="region__link link" data-city>
                      Уфа
                    </a>
                  </li>

                  <li class="region__item" data-region-item>
                    <a href="#!" class="region__link link" data-city>
                      Москва
                    </a>
                  </li>
                </ul>
              </div>
            </li>-->
  */
  getColumnsCityListHtml = () => {
    return (/*html*/`
    <ul class="city-list__col"></ul>
  `)
  }



  //Общая функция отрисовки
  _render = ($parent, getHtmlMarkup, array = false) => {
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

  clearParent = () => {
    this.$parent.innerHTML = '';
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
    this.$cities = null;
    this.inputValue = '';
    this.isHasListCity = false;
  }

  openCityModal = async () => {
    this.open();
    if (this.isHasListCity) {
      return;
    }
    if (!this.isHasListCity) {
      this.render.clearParent();
      this.render.renderSpiner('Идет загрузка...');
      await this.createListCity();
    }

  }

  createListCity = async () => {
    this.regionList = await this.server.getCity();

    if (!this.regionList.rez) {
      this.render.renderErrorMsg(this.regionList.error.desc);
      console.log(`Ошибка: ${regionList.error.id}`);
    }

    if (this.regionList.rez) {
      this.render.delete('[data-spinner]');
      this.render.renderListCity(this.regionList.content);
      this.isHasRegionList = this.regionList.rez;
    }


  }

  searchCity = () => {
    this.changeInputValue();
    this.showFindedCity()
  }

  changeInputValue = () => {
    this.inputValue = this.$searchCityInput.value.trim().toLowerCase();
  }

  showFindedCity = () => {
    this.$cities.forEach(el => {
      const cityName = el.innerHTML.toLowerCase().trim();
      const res = cityName.includes(this.inputValue);
      const $li = el.closest('[data-list-item]');
      this.hideCity($li);
      if (res === '') {
        this.showCity($li);
      }
      if (res) {
        this.showCity($li);
      }
    })
  }

  showCity($li) {
    $li.classList.remove('city-hide');
  }

  hideCity($li) {
    $li.classList.add('city-hide');
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
  const $dropdownBody = getDropdownBody(target);
  const isClose = $dropdownBody.dataset.dropdownClose;

  if (isClose == 'close') {
    openDropdown($dropdownBody)
  }

  if (isClose == 'open') {
    closeDropdown($dropdownBody)
  }
}

function getDropdownBody(target) {
  const $dropdown = target.closest('[data-dropdown]');
  return $dropdown.querySelector('[data-dropdown-close]');
}

function openDropdown($dropdownBody) {
  const $dropdownList = $dropdownBody.querySelector('[data-dropdown-list]');
  const dropdownListHeight = $dropdownList.offsetHeight;
  $dropdownBody.style.height = dropdownListHeight + 'px';
  $dropdownBody.dataset.dropdownClose = 'open';
}

function closeDropdown($dropdownBody) {
  $dropdownBody.style.height = 0 + 'px';
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
