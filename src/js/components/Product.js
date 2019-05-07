import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    // console.log('new Product: ', thisProduct);
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
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;
    const trigger = thisProduct.accordionTrigger;
    // console.log('triggers: ', trigger);
    trigger.addEventListener('click', function(){
    // console.log('clicked');
      event.preventDefault();
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      // console.log('klasa acive dodana:', thisProduct.element);
      const products = document.querySelectorAll('article.active');
      for(let product of products){
        if(product != thisProduct.element){
          product.classList.remove(classNames.menuProduct.wrapperActive);
          // console.log('klasa active usunięta', product);
        }
      }
    });
  }

  initOrderForm(){
    const thisProduct = this;
    // console.log('initOrderForm', thisProduct);
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
      thisProduct.addToCart();
    });
  }

  processOrder(){
    const thisProduct = this;
    // console.log('processOrder: ', thisProduct);
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData: ', formData);
    thisProduct.params = {};
    let price = thisProduct.data.price;
    // console.log('price: ', price);
    for(let paramId in thisProduct.data.params){
      const selected = thisProduct.data.params[paramId];
      for(let optionId in selected.options){
        const option = selected.options[optionId];
        // console.log('option: ', option);
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        if(optionSelected && !option.default){
          // console.log('!option default:', !option.default);
          price += option.price;
          // console.log('price +:', option.price);
        } else if(!optionSelected && option.default){
          price -= option.price;
          // console.log('price -:', option.price);
        }
        const imagesClass = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        // console.log('imagesClass: ', imagesClass);
        if(optionSelected){
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: option.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          for(let imageClass of imagesClass){
            imageClass.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for(let imageClass of imagesClass){
            imageClass.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.price;
    console.log('thisProduct.params:', thisProduct.params);
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}
