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
    this.$searchCityInput = this.$modal.querySelector('#searchCityInput');
    this.$listItem = this.$modal.querySelectorAll('[data-list-item]');
    this.$cities = this.$modal.querySelectorAll('[data-city]');
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
}

function searchCity(e) {
  const value = e.target.value.trim().toLowerCase();
  const city = selectCityModal.querySelectorAll('[data-city]');
  city.forEach(el => {
    const cityName = el.innerHTML.toLowerCase();
    const res = cityName.includes(value);
    const li = el.closest('.select-city__item');
    li.classList.add('select-city__item--is-hide');
    if (res === '') {
      li.classList.remove('select-city__item--is-hide');
    }
    if (res) {
      li.classList.remove('select-city__item--is-hide');
    }

  })
}

const searchModal = new SearchModal('#searchModal');
const cityModal = new CityModal('#cityModal');
const callBackModal = new CityModal('#callBackModal');

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


