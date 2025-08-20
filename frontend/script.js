// const API_URL = "http://localhost:8080/api"; // backend URL
const API_URL = "https://e-commerce-app-tqs1.onrender.com/api"; // backend URL

let token = "";
let page = 1;

// AUTH
async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        alert(JSON.stringify(data.message));
    }
    catch (error) {
        alert("error in register");
        console.error("Error in register: ", error);
    }

}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
    
        if(!res.ok){
            alert(`error in login\n, ${data.message}`);
            return;
        }
        
        token = data.token;
        document.getElementById("authStatus").innerText = "Logged in as " + data.user.email;
    }
    catch (error) {
        alert("error in login");
        console.error("Error in login: ", error);
    }

}

// PRODUCTS
async function fetchProducts() {
    try {
        const search = document.getElementById("search").value.trim();
        const res = await fetch(`${API_URL}/products?page=${page}&search=${search}`);

        const products = await res.json();
        // console.log("Product: ",products);
        const container = document.getElementById("products");
        container.innerHTML = "";
        products.products.forEach(p => {
            const div = document.createElement("div");
            div.className = "product";
            div.innerHTML = `
          <b>${p.name}</b> - $${p.price} (${p.stock || 0} in stock)
          <button onclick="addToCart('${p._id}')">Add to Cart</button>
          <button onclick="deleteProduct('${p._id}')">Delete (Admin)</button>
        `;
            container.appendChild(div);
        });
    }
    catch (error) {
        console.error("Error in fetching products: ", error);
    }

}

function nextPage() { page++; document.getElementById("pageNum").innerText = page; fetchProducts(); }
function prevPage() { if (page > 1) { page--; document.getElementById("pageNum").innerText = page; fetchProducts(); } }

// ADMIN: Add product
async function addProduct() {
    const name = document.getElementById("pname").value;
    const price = document.getElementById("pprice").value;
    const category = document.getElementById("pcategory").value;
    const stock = document.getElementById("pstock").value;

    try {
        const res = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify({ name, price, category, stock })
        });
        const data = await res.json();
        alert("Product added: " + JSON.stringify(data));
        fetchProducts();
    }
    catch (error) {
        alert("error in adding product\n", error?.response?.message);
        console.error("Error in adding product: ", error);
    }

}

async function deleteProduct(id) {
    try {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        alert("Deleted: " + JSON.stringify(data));
        fetchProducts();
    } catch (error) {
        alert("error in deleting product");
        console.error("Error in deleting product: ", error);
    }

}

// CART
async function addToCart(productId) {
    try {
        const res = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        const data = await res.json();
        alert("Added to cart");
        fetchCart();
    }
    catch (error) {
        alert("error in adding item to cart");
        console.error("Error in adding item to cart: ", error);
    }

}

async function fetchCart() {
    try {
        const res = await fetch(`${API_URL}/cart`, {
            headers: { Authorization: "Bearer " + token }
        });
        const cart = await res.json();
        const container = document.getElementById("cart");
        container.innerHTML = "";
        cart.items.forEach(i => {
            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `${i.product.name} x ${i.quantity}`;
            container.appendChild(div);
        });
    }
    catch (error) {
        alert("error in fetching cart items");
        console.error("Error in fetching cart items: ", error);
    }

}

// ORDER
async function placeOrder() {
    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        alert("Order placed: " + JSON.stringify(data));
        fetchCart();
    }
    catch (error) {
        alert("error in placing order, try again");
        console.error("Error in placing order: ", error);
    }

}

// Initial load
fetchProducts();