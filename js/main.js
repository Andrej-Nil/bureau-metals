'use strict';

//const $body = document.querySelector('body');
const $openSearchBtn = document.querySelector('#openSearchBtn');
const $openSearchMobileBtn = document.querySelector('#openSearchMobileBtn');

const $searchModal = document.querySelector('#searchModal');

class Modal {
  constructor(modalId) {
    this.$modal = document.querySelector(modalId);
    this.$body = document.querySelector('body');
    this.listener();
  }

  listener = () => {
    this.$modal.addEventListener('click', (e) => {
      const btn = e.target;
      if (btn.hasAttribute('data-close')) {
        this.close();
      }
    })
  }

  open = () => {
    this.$modal.classList.remove('modal--is-hide');
    this.$modal.classList.add('modal--is-open');

    this.$body.classList.add('no-scroll');
  }

  close = () => {
    this.$modal.classList.remove('modal--is-open');
    this.$body.classList.remove('no-scroll');
    setTimeout(() => {
      this.$modal.classList.add('modal--is-hide');
    }, 500)
  }
}

const searchModal = new Modal('#searchModal');

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



//document.addEventListener('click', (e) => closeModal(e));

//function closeModal(e) {
//  const btn = e.target;
//  console.log(btn)
//}


//function openModal($modal) {
//  $modal.classList.add('modal--is-show');
//  $body.classList.add('no-scroll');
//}
