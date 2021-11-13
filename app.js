// SELECTORS
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// CART
let cart = [];
// add to bag buttons
let buttonsDOM = [];

// get the product method
// fetch the url --> will return a promise so need to wait
class Products {
	async getProducts() {
		try {
			let res = await fetch("products.json"); //got back the response but no data
			let data = await res.json(); //convert the response to json
			let products = data.items;
			products = products.map((product) => {
				// destructure
				const { title, price } = product.fields;
				const { id } = product.sys;
				const image = product.fields.image.fields.file.url;
				return { id, title, price, image };
			});
			return products;
		} catch (err) {
			console.log(err);
		}
	}
}

// display products --> index.js for REACT
class UI {
	displayProducts(products) {
		let res = "";
		products.forEach((product) => {
			res += `
            <article class="product">
					<div class="img-container">
						<img
							src=${product.image}
							alt="product"
							class="product-img"
						/>
						<button class="bag-btn" data-id=${product.id}>
							<i class="fas fa-shopping-cart"></i>
							add to bag
						</button>
					</div>
					<h3>${product.title}</h3>
					<h4>$${product.price}</h4>
				</article>
                `;
		});
		productsDOM.innerHTML = res;
	}

	getBagButtons() {
		const buttons = [...document.querySelectorAll(".bag-btn")]; //turn the result into an array. w/o the [...] get back a Node list
		buttons.forEach((button) => {
			let id = button.dataset.id;
			let inCart = cart.find((item) => item.id === id);

			// if the item is in the cart --> update text and user can't add to cart again
			// else add to the cart and disable the add to cart button
			if (inCart) {
				button.innerText = "In Cart";
				button.disabled = true;
			}

			// else do all of this
			button.addEventListener("click", (e) => {
				e.target.innerText = "In Cart";
				e.target.disabled = true;
				// get item from products, set amount, add item to cart, save the cart in local storage, set cart, display in cart, show the cart
				let cartItem = { ...Storage.getProduct(id), amount: 1 };
				cart = [...cart, cartItem];
				Storage.saveCart(cart);
				this.setCartValues(cart);
				this.addCartItem(cartItem);
				this.showCart();
			});
		});
	}

	setCartValues(cart) {
		let tempCartTotal = 0;
		let itemsInCart = 0;
		cart.map((item) => {
			tempCartTotal += item.price * item.amount;
			itemsInCart += item.amount;
		});
		cartTotal.innerText = parseFloat(tempCartTotal.toFixed(2));
		cartItems.innerText = itemsInCart;
	}

	addCartItem(item) {
		const div = document.createElement("div");
		div.classList.add("cart-item");
		div.innerHTML = `<img src=${item.image} alt="product" />
						<div>
							<h4>${item.title}</h4>
							<h5>$${item.price}</h5>
							<span class="remove-item" data-id=${item.id}>
								<i class="far fa-trash-alt"></i>
							</span>
						</div>
						<div>
							<i class="fas fa-chevron-up" data-id=${item.id}></i>
							<p class="item-amount">${item.amount}</p>
							<i class="fas fa-chevron-down" data-id=${item.id}></i>
						</div>`;
		cartContent.appendChild(div);
	}

	showCart() {
		cartOverlay.classList.add("cartVisible");
		cartDOM.classList.add("showCart");
	}
}

// local storage
// use static because we do not need to create an instance of the cart
class Storage {
	// save data --->[products] to local storage which has a built in method setItem
	static saveProducts(products) {
		localStorage.setItem("products", JSON.stringify(products));
	}

	static getProduct(id) {
		let products = JSON.parse(localStorage.getItem("products")); //use parse because we stored it as a string
		return products.find((product) => product.id === id);
	}

	static saveCart(cart) {
		localStorage.setItem("cart", JSON.stringify(cart));
	}
}

// EVENT LISTENERS
document.addEventListener("DOMContentLoaded", () => {
	const ui = new UI();
	const products = new Products();

	// get all products
	// instance --> products
	products
		.getProducts()
		.then((products) => {
			ui.displayProducts(products);
			Storage.saveProducts(products);
		}) // after the products load activate the bag-btns on each item
		.then(() => {
			ui.getBagButtons();
		});
});
