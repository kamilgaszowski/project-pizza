import {select, settings, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {CartProduct} from './CartProduct.js';

export class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    console.log('new Cart: ', thisCart.products);
  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.renderTotatlsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
    for(let key of thisCart.renderTotatlsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions(){
    const thisCart = this;
    const triggerCart = thisCart.dom.toggleTrigger;
    console.log('triggerCart: ', triggerCart);
    triggerCart.addEventListener('click', function(){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    const payload = {
      phone: thisCart.dom.phone.value,
      address: thisCart.dom.address.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalNumber: thisCart.totalNumber,
      products: [],
    };

    for(let product of thisCart.products){
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }



  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    console.log('adding product: ', menuProduct);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }

  update(){
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(let product of thisCart.products){
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    console.log('totalNumber', thisCart.totalNumber);
    console.log('subtotalPrice', thisCart.subtotalPrice);
    console.log('thisCart.totalPrice', thisCart.totalPrice);
    for(let key of thisCart.renderTotatlsKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }

  remove(cartProduct){
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    console.log('index', index);
    const removeIndex = thisCart.products.splice(index, 1);
    console.log('remove index', removeIndex);

    cartProduct.dom.wrapper.remove();
    thisCart.update();

  }
}
