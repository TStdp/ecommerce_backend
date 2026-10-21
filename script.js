// JavaScript
let db;

async function initDB() {
    // open the database connection
    db = await $BSD.db.open("ecommerce");
    
    // call showOrders function
    showOrders();
}

// create a reference to the ordersContainer
let ordersContainer = document.getElementById("ordersContainer");

// create a reference to the productsContainer
let productsContainer = document.getElementById("productsContainer");

// create a reference to the order's table
let orderTable = document.querySelector("#ordersContainer tbody");

let allProducts;

// create a reference to the product row
let productsRow = document.querySelector("#productsContainer .row");

// create a reference to the overlay
let overlay = document.getElementById("overlay");

// create a reference to the editProduct sidebar
let editProduct = document.getElementById("editProduct");

// create a reference to the editaProduct ID
let editProductId = document.getElementById("productId");

// create a reference to the edit product name
let editProductName = document.getElementById("productName");

// create a reference to the edit product price
let editProductPrice = document.getElementById("productPrice");

// create a reference to the edit product description
let editProductDesc = document.getElementById("productDescription");

// create a reference to the edit product image
let editProductImageFile = document.getElementById("productImageFile");

// create a reference to the edit image preview
let editProductImagePreview = document.getElementById("productImagePreview");

// create a reference to the newProduct sidebar
let newProduct = document.getElementById("newProduct");

// create a reference to the new product name
let newProductName = document.getElementById("newProductName");

// create a reference to the new product price
let newProductPrice = document.getElementById("newProductPrice");

// create a reference to the new product description
let newProductDesc = document.getElementById("newProductDesc");

// create a reference to the new product image
let newProductImageFile = document.getElementById("newProductImageFile");

// create a reference to the new product image preview
let newProductImagePreview = document.getElementById("newProductImagePreview");

function showOrders() {
    ordersContainer.className = "";
    productsContainer.className = "d-none";
    getAllOrders();
}

function showProducts() {
    ordersContainer.className = "d-none";
    productsContainer.className = "";
    getAllProducts();
}

function getAllProducts() {
    db.get("allProducts").then(function(productList) {
        // store the product data in the global variable
        allProducts = productList || [];
        
        // reset the product row
        productsRow.innerHTML = "";
        
        allProducts.forEach(function(productData) {
            //console.log(productData);
            
            // create a product container
            let productContainer = document.createElement("div");
            productContainer.className = "col-lg-3 col-md-4 col-6 mb-4";
            productsRow.appendChild(productContainer);
            
            // create a product card
            let productCard = document.createElement("div");
            productCard.className = "card h-100";
            productContainer.appendChild(productCard);
            
            // create a product image
            let productImg = document.createElement("img");
            productImg.src = productData.image;
            productImg.className = "card-img-top";
            productCard.appendChild(productImg);
            
            // create a card body
            let cardBody = document.createElement("div");
            cardBody.className = "card-body d-flex flex-column";
            productCard.appendChild(cardBody);
            
            // create a product title
            let productTitle = document.createElement("h4");
            productTitle.className = "card-title";
            productTitle.innerText = productData.name;
            cardBody.appendChild(productTitle);
            
            // create a product price
            let productPrice = document.createElement("h6");
            productPrice.innerText = "$" + productData.price.toFixed(2);
            cardBody.appendChild(productPrice);
            
            // create a product description
            let productDescription = document.createElement("p");
            productDescription.innerText = productData.description.substring(0, 70) + "...";
            cardBody.appendChild(productDescription);
            
            // create an edit button
            let editBtn = document.createElement("a");
            editBtn.className = "btn btn-sm btn-outline-primary mt-auto mb-2";
            editBtn.innerText = "EDIT";
            editBtn.onclick = function () {
                openEditProduct(productData);
            };
            cardBody.appendChild(editBtn);
            
            // create a delete button
            let deleteBtn = document.createElement("a");
            deleteBtn.className = "btn btn-sm btn-outline-danger";
            deleteBtn.innerText = "DELETE";
            deleteBtn.onclick = function() {
                let confirmDeletion = confirm("Are you sure you want to delete " + productData.name + " ?");
                
                // check if the confirmDeletion is true
                if (confirmDeletion) {
                    let updatedProducts = allProducts.filter(function(product) {
                        if (product.id == productData.id) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    });
                    
                    // save the data to the database
                    db.set("allProducts", updatedProducts).then(function() {
                       getAllProducts(); 
                    });
                }
            };
            cardBody.appendChild(deleteBtn);
        });
    });
}

function openNewProduct() {
    // reset the input form
    newProductName.value = "";
    newProductPrice.value = "";
    newProductDesc.value = "";
    newProductImageFile.value = "";
    newProductImagePreview.src = "";
    
    overlay.className = "active";
    newProduct.className = "active";
}

function previewNewProductImage() {
    newProductImagePreview.src = newProductImageFile.value;
}

function addNewProduct() {
    if (newProductName.value != "" && newProductPrice.value != "" && newProductDesc.value != "" && newProductImageFile.value != "") {
        let newProductObj = {
            id: Date.now(),
            name: newProductName.value,
            price: parseFloat(newProductPrice.value),
            description: newProductDesc.value,
            image: newProductImageFile.value
        };
        
        // add the new product object to the allProducts array
        allProducts.push(newProductObj);
        
        // save the allProducts to the database
        db.set("allProducts", allProducts).then(function() {
            // close the sidebar
            overlayClicked();
            
            // show the updated products
            getAllProducts();
        });
    }
    else {
        alert("Please fill in all the product information.");
    }
}

function openEditProduct(productData) {
    editProductId.value = productData.id;
    editProductName.value = productData.name;
    editProductPrice.value = productData.price;
    editProductDesc.value = productData.description;
    editProductImageFile.value = productData.image;
    editProductImagePreview.src = productData.image;
    
    overlay.className = "active";
    editProduct.className = "active";
}

function updateImagePreview() {
    editProductImagePreview.src = editProductImageFile.value;
}

function updateProduct() {
    allProducts.forEach(function(product) {
        if (editProductId.value == product.id) {
            product.name = editProductName.value;
            product.price = parseFloat(editProductPrice.value);
            product.description = editProductDesc.value;
            product.image = editProductImageFile.value;
        }
    });
    
    // update the product data to the database
    db.set("allProducts", allProducts).then(function() {
        // close the sidebar
        overlayClicked();
        
        // fetch the updated data
        getAllProducts();
    });
}

function getAllOrders() {
    
    // reset the orderTable
    orderTable.innerHTML = "";
    
    db.listKeys("order").then(function(orderList) {
        orderList.forEach(function(orderKey) {
            db.get(orderKey).then(function(orderData) {
                //console.log(orderData);
                
                // create a row
                let row = document.createElement("tr");
                orderTable.appendChild(row);
                
                // show the buyer's name
                let bName = document.createElement("td");
                bName.innerHTML = orderData.buyerName;
                row.appendChild(bName);
                
                // show the buyer's email
                let bEmail = document.createElement("td");
                bEmail.innerHTML = orderData.buyerEmail;
                row.appendChild(bEmail);
                
                // show the buyer's address
                let bAddress = document.createElement("td");
                bAddress.innerHTML = orderData.buyerAddress;
                row.appendChild(bAddress);
                
                // show the buyer's orders
                let orderList = "";
                orderData.orders.forEach(function(order) {
                    orderList += "<p>" + order.name + " x " + order.quantity + "</p>";
                });
                let buyerOrders = document.createElement("td");
                buyerOrders.innerHTML = orderList;
                row.appendChild(buyerOrders);
                
                // show the subtotal
                let subtotal = document.createElement("td");
                subtotal.innerHTML = orderData.totalPrice.toFixed(2);
                row.appendChild(subtotal);
                
                // show the order date
                let date = document.createElement("td");
                date.innerHTML = new Date(orderData.timestamp).toLocaleDateString("en-US");
                row.appendChild(date);
            });
        });
    });
}

function overlayClicked() {
    overlay.className = "";
    editProduct.className = "";
    newProduct.className = "";
}


initDB();


