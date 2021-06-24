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
  }

  getToken = () => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta.getAttribute('content');
  }
}

class Modal {
  constructor(modalId) {
    this.$modal = doc.querySelector(modalId);
    this.$body = doc.querySelector('body');
    this.closeModal()
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
    this.$searchArea = this.$modal.querySelector('#searchArea');
    this.$areaListBody = this.$searchArea.querySelector('#areaListBody');
    this.$areaList = this.$searchArea.querySelector('#areaList');
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
    this.$listItem = this.getElemants('[data-list-item]');
    this.$cities = this.getElemants('[data-city]');
    this.inputValue = '';
    this.searchCityInputListener();

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

  getElement = (selector) => {
    if (!this.$modal) {
      return false;
    }
    return this.$modal.querySelector(selector);
  }

  getElemants = (selector) => {
    if (!this.$modal) {
      return false;
    }
    return this.$modal.querySelectorAll(selector);
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

const searchModal = new SearchModal('#searchModal');
const cityModal = new CityModal('#cityModal');
const callBackModal = new CityModal('#callBackModal');
const fastOrderModal = new FastOrderModal('#fastOrdenModal');
const consultationModal = new ConsultationModal('#consultationModal')

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
    cityModal.open();
  });
}

if ($openCityModalMobileBtn && $cityModal) {
  $openCityModalMobileBtn.addEventListener('click', () => {
    cityModal.open();
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

function docListener(e) {
  const target = e.target;
  if (target.closest('[data-fast-order]')) {
    fastOrderModal.openFastOrder(target);
  }
}

