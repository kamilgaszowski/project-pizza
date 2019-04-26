/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();

      thisProduct.getElements();

      thisProduct.initAccordion();

      thisProduct.initOrderForm();

      thisProduct.processOrder();

      console.log('new Product: ', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      const menuContainer = document.querySelector(select.containerOf.menu);

      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }

    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger */
      const trigger = thisProduct.accordionTrigger;
      console.log('triggers: ', trigger);
      /* START: click event listener to trigger */
      trigger.addEventListener('click', function(){
        console.log('clicked');
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.add('active');
        console.log('klasa acive dodana:', thisProduct.element);
        /* find all active products */
        const products = document.querySelectorAll('article.active');
        /* START LOOP: for each active product */
        for(let product of products){
          /* START: if the active product isn't the element of thisProduct */
          if(product != thisProduct.element){
          /*remove class active for the active product */
            product.classList.remove('active');
            console.log('klasa active usunięta', product);
          }
          /* END: if the active product isn't the element od thisProduct */
        }
        /* End LOOP: for each active product */
      });
      /* END: click event listener to trigger */
    }

    initOrderForm(){
      const thisProduct = this;

      console.log('initOrderForm', thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;
      console.log('processOrder: ', thisProduct);

      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData: ', formData);

      let price = thisProduct.data.price;
      console.log('price: ', price);

      for(let paramId in thisProduct.data.params){


        const selected = thisProduct.data.params[paramId];


        for(let optionId in selected.options){

          const option = selected.options[optionId];
          console.log('option: ', option);
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId];

          if(optionSelected && !option.default){
            console.log('option default:', option.default);
            price += option.price;

          } else if(!optionSelected && option.default){
            price -= option.price;
          }
          console.log('price:', price);
        }
      }
      thisProduct.priceElem.innerHTML = price;


    }
  }
  const app = {
    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data: ', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
  };


  app.init();
}




