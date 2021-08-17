const items = document.querySelector('.items');
const olCartList = document.querySelector('ol');
const myTotalPrice = document.querySelector('.total-price');
const loadingText = document.createElement('span');

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

const cartItemClickListener = () => {
  olCartList.addEventListener('click', (event) => {
    const isLi = event.target.nodeName === 'LI';
    if (!isLi) {
      return;
    }
    const totalPrice = parseFloat(myTotalPrice.innerText);
    const removedItemInnerText = event.target.innerText;
    const removedItemPrice = parseFloat(removedItemInnerText.split('$')[1]);
    myTotalPrice.innerText = (totalPrice - removedItemPrice);
    event.target.remove();
    localStorage.setItem('myCartList', olCartList.innerHTML);
    localStorage.setItem('totalPrice', myTotalPrice.innerText);
  });
};

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  return li;
}

const myLoadingText = () => {
  loadingText.innerText = 'loading...';
  loadingText.className = 'loading';
  items.appendChild(loadingText);
};

const getProducts = async () => {
  myLoadingText();
  items.appendChild(loadingText);
  fetch('https://api.mercadolibre.com/sites/MLB/search?q=computer')
    .then((response) => response.json())
    .then((result) => result.results)
    .then((data) => {
      data.map(({ id: sku, title: name, thumbnail: image }) =>
        items.appendChild(createProductItemElement({ sku, name, image })));
    })
    .then(() => document.getElementsByClassName('loading')[0].remove())
    .catch((error) => console.log('erro!', error));
};

const fetchItemById = async (itemId) => {
  const myFetch = await fetch(`https://api.mercadolibre.com/items/${itemId}`);
  const response = await myFetch.json();
  return response;
};

const increaseTotalPrice = () => {
  const totalPrice = parseFloat(myTotalPrice.innerText);
  const addedItemInnerText = olCartList.lastChild.innerText;
  const addedItemPrice = parseFloat(addedItemInnerText.split('$')[1]);

  myTotalPrice.innerText = (totalPrice + addedItemPrice);
};

const addToCart = () => {
  items.addEventListener('click', async function createElement(event) {
    const isButton = event.target.nodeName === 'BUTTON';
    if (!isButton) {
      return;
    }
    const item = event.target.parentNode;
    const itemId = item.querySelector('span.item__sku').innerText;
    const fetchItem = await fetchItemById(itemId);
    const createElementById = ({ id: sku, title: name, price: salePrice }) => {
      olCartList.appendChild(createCartItemElement({ sku, name, salePrice }));
    };
    createElementById(fetchItem);
    localStorage.setItem('myCartList', olCartList.innerHTML);
    increaseTotalPrice();
    localStorage.setItem('totalPrice', myTotalPrice.innerText);
  });
};

const loadCartItems = () => {
  olCartList.innerHTML = localStorage.getItem('myCartList');
  if (document.querySelectorAll('.cart__item').length >= 1) {
    myTotalPrice.innerText = localStorage.getItem('totalPrice');
  }
};

const emptyCart = () => {
  const clearButton = document.querySelector('.empty-cart');
  clearButton.addEventListener('click', () => {
    olCartList.innerHTML = '';
    document.querySelector('.total-price').innerText = '0';
    localStorage.clear();
  });
};

window.onload = () => {
  getProducts();
  addToCart();
  loadCartItems();
  cartItemClickListener();
  emptyCart();
};