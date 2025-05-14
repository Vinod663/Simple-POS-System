import {items_db, orders_db, customers_db} from "../db/db.js";
import OrderModel from "../model/OrderModel.js";

const orderItems = [];
let fullTotal = 0;
let subTotal=0

orders_db.length = 0; // Clear the orders_db array
const savedOrders= localStorage.getItem("order_data");
if (savedOrders) {
    orders_db.push(...JSON.parse(savedOrders));//...->spread operator(spreads out all the items from an array one by one.), JSON.parse() = Convert text back to array
}
loadOrderDetailTable();
addDataLabel();

$('#addItemBtn').on('click', function(e){
    e.preventDefault();

    let itemId=$('#selectItemCode').val();
    if (!itemId) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please select an item!',
        });
        return;
    }

    // Check for duplicate item
    const exists = orderItems.some(item => item.itemId === itemId);
    if (exists) {
        Swal.fire({
            icon: 'warning',
            title: 'Duplicate Item',
            text: 'This item is already added to the order!',
        });
        return;
    }


    let itemName=items_db.find(item => item.item_id === itemId).item_name;
    let itemCategory=$('#selectItemCategory').val();

    let itemQty = parseInt($('#selectItemQuantity').val());
    let checkQty = parseInt(items_db.find(item => item.item_id === itemId).item_qty);
    if (itemQty > checkQty) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Quantity exceeds available stock!',
        })
        return;
    }

    /*console.log("Price input value:", $('#itemPrice').val());*/
    let rawPrice = $('#itemPrice').val();  // e.g. "Rs.100.00"
    let itemPrice = parseFloat(rawPrice.replace("Rs.", "").trim());

    let itemTotalPrice=itemQty*itemPrice;

    /*if (itemId === '' || itemName === '' || itemCategory === '' || itemQty === '' || itemPrice === '') {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill all fields!',
        })
        return;
    }*/

    let data = `<tr>
                        <td>${itemId}</td>
                        <td>${itemName}</td>
                        <td>${itemPrice.toFixed(2)}</td>
                        <td>${itemQty}</td>
                        <td>${itemTotalPrice.toFixed(2)}</td>
                        <td>
                        <button type="button" class="btn btn-sm btn-danger remove-item">
                            <i class="fa-solid fa-trash" style="color: #ffffff;"></i>
                        </button>
                         </td>
                    </tr>`
        $('#order-tbody').append(data);
        orderItems.push({
            itemId,
            itemName,
            itemCategory,
            itemQty,
            itemPrice,
            itemTotalPrice});

        console.log(orderItems);
        fullTotal += itemTotalPrice;
        // Optional: update a total display field
        $('#totalAmount').text(`Total: Rs. ${fullTotal.toFixed(2)}`);
        calculateSubTotal();

        //clear input fields
        $('#selectItemCode').val('');

        $('#itemSelect').empty().append(`
        <option value="" selected disabled hidden>Select item</option>`)

        items_db.map((item, index) => {
            let id = item.item_id;
            let name = item.item_name;

            let data = `<option value="${id}">${name}</option>`

            $('#itemSelect').append(data);

        });

        $('#selectItemCategory').val('');
        $('#selectItemQuantity').val("1");
        $('#itemPrice').val('');


});

// ✅ Remove item from table and array
$('#order-tbody').on('click', '.remove-item', function(){
    const row = $(this).closest('tr');
    const price = parseFloat(row.find('td:eq(4)').text());
    fullTotal -= price;

    // Remove from orderItems array as well (optional)
    const itemCode = row.find('td:eq(0)').text();
    const index = orderItems.findIndex(item => item.itemId === itemCode);
    if (index !== -1) orderItems.splice(index, 1);
    console.log(orderItems);

    row.remove();

    // Update total
    $('#totalAmount').text(`Total: Rs. ${fullTotal.toFixed(2)}`);
    calculateSubTotal();
});

function calculateSubTotal(){
    /*let totalText = $('#totalAmount').text();*/ // "Total: Rs. 300.00"
    subTotal = parseFloat(fullTotal); // 300.00

    let discountVal = $('#discountAmount').val();
    if (discountVal !== '') {
        let discount = parseFloat(discountVal);
        if (!isNaN(discount)) {
            if ($('#discountType').val() === '%') {
                subTotal -= (subTotal * (discount / 100));
            } else {
                subTotal -= discount;
            }
        }
    }

    console.log("Sub Total: "+subTotal);
    $('#subTotalAmount').text(`Sub Total: Rs. ${subTotal.toFixed(2)}`);
}

$('#discountBtn').on('click', function(){
    calculateSubTotal();
});

$('#purchaseBtn').on('click', function(){
    let ordId = $('#selectOrderID').val().trim();
    let ordDate=$('#SelectOrderDate').val();
    let custId = $('#selectCustomerID').val();
    let custName = $('#customerSelect option:selected').text();
    let custEmail= $('#SelectCustomerEmail').val();
    let custPhone= $('#SelectCustomerPhone').val();

    $('#orderIDError').text('');
    $('#selectOrderID').css('border-color', '');
    let hasError = false;

    if (ordId === '' || ordDate === '' || custId === '' || custName === '' || custEmail === '' || custPhone === '') {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please fill all fields in Invoice section!',
        })
        return;
    }

    if (!/^ORD-\d{4}$/.test(ordId)) {
        $('#orderIDError').text('ID must be like ORD-1001');
        $('#selectOrderID').css('border-color', 'red');
        hasError = true;
    }

    if (hasError) return;


    const trimmedOrdId = ordId.trim();
    const exists = orders_db.some(order => order.order_id.trim() === trimmedOrdId);
    if (exists) {
        Swal.fire({
            title: 'Duplicate ID!',
            text: 'Order ID already exists',
            icon: 'warning',
            confirmButtonText: 'Ok'
        });
        return;
    }

    if (orderItems.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No items added to the order!',
        })
        return;
    }

    let cash = parseFloat($('#cashAmount').val());
    if(cash<subTotal||isNaN(cash)){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Invalid Cash Amount!',
        })
        return;
    }
    let balance = cash - subTotal;
    let change = parseFloat(balance.toFixed(2));
    $('#balanceAmount').val("RS."+change+".00");
    console.log("Balance: "+change);

    Swal.fire({
        title: 'Order Confirmation',
        text: `Are you sure you want to confirm this order?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, confirm it!',
        cancelButtonText: 'No, cancel it!'

    }).then((result) => {
        if (result.isConfirmed) {
            let discount = parseFloat($('#discountAmount').val());
            let discountType = $('#discountType').val();

            let orderData = new OrderModel(ordId, custId, custName, custEmail, custPhone, ordDate, JSON.parse(JSON.stringify(orderItems)), fullTotal, subTotal,cash,change,discount,discountType);
            orders_db.push(orderData);

            localStorage.setItem("order_data", JSON.stringify(orders_db));//save to localStorage
            console.log("Order DB: "+orders_db);
            resetItemsQty();//update item quantity//
            loadItemTable();//reload item table//
            addDataLabel();//add data-label to table//
            resetFields();//reset all fields
            loadOrderDetailTable();
            /*console.log(orderData);*/

            Swal.fire({
                title: 'Order Confirmed!',
                text: `Order ID: ${ordId}`,
                icon: 'success',
                confirmButtonText: 'Ok'
            });
        }
    });



});

function resetItemsQty(){
    orderItems.forEach(item => {
        let itemId = item.itemId;
        let itemQty = parseInt(item.itemQty);
        let index = items_db.findIndex(i => i.item_id === itemId);
        if (index !== -1) {
            items_db[index].item_qty -= itemQty;
        }
    });

    localStorage.setItem("item_data", JSON.stringify(items_db));//save to localStorage
    console.log(items_db);
}

function loadItemTable() {
    $('#item-tbody').empty();
    items_db.map((item, index) => {
        let id = item.item_id;
        let name = item.item_name;
        let category = item.item_category;
        let qty = item.item_qty;
        let price = item.item_price;

        let data = `<tr>
                        <td>${id}</td>
                        <td>${name}</td>
                        <td>${category}</td>
                        <td>${qty}</td>
                        <td>${price}</td>
                   </tr>`

        $('#item-tbody').append(data);
    });
}

function addDataLabel(){
    const headers = document.querySelectorAll('#orderDetailTable th');
    const rows = document.querySelectorAll('#orderDetailTable tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            if (headers[index]) {
                cell.setAttribute('data-label', headers[index].innerText);
            }
        });
    });
}

function resetFields(){
    $('#selectOrderID').val('');
    $('#SelectOrderDate').val('');
    $('#selectCustomerID').val('');

    $('#customerSelect').empty().append(`
    <option value="" selected disabled hidden>Select Customer</option>
    `)
    customers_db.map((customer, index) => {
        let id = customer.customer_id;
        let name = customer.customer_name;

        let data = `<option value="${id}">${name}</option>`

        $('#customerSelect').append(data);
    });
    $('#SelectCustomerEmail').val('');
    $('#SelectCustomerPhone').val('');


    $('#selectItemCode').val('');
    $('#itemSelect').empty().append(`
        <option value="" selected disabled hidden>Select item</option>`)

    items_db.map((item, index) => {
        let id = item.item_id;
        let name = item.item_name;

        let data = `<option value="${id}">${name}</option>`

        $('#itemSelect').append(data);

    });

    $('#selectItemCategory').val('');
    $('#selectItemQuantity').val("1");
    $('#itemPrice').val('');
    $('#order-tbody').empty();

    $('#subTotalAmount').text(`Sub Total: Rs. 0.00`);
    $('#totalAmount').text(`Total: Rs. 0.00`);
    $('#cashAmount').val('');
    $('#discountAmount').val('');
    $('#discountType').val('%');
    $('#balanceAmount').val('');


    orderItems.length = 0;
    fullTotal = 0;
    subTotal = 0;
}

function loadOrderDetailTable() {
    $('#orderDetail-tbody').empty();
    orders_db.map((order, index) => {
        let id = order.order_id;
        let custId = order.customer_id;
        let name = order.customer_name;
        let date = order.order_date;
        let items = order.order_items;
        let totalQty = items.reduce((sum, items) => sum + parseInt(items.itemQty), 0);
        let total = order.total_order_amount;

        let data = `<tr>
                        <td>${id}</td>
                        <td>${custId}</td>
                        <td>${name}</td>
                        <td>${date}</td>
                        <td>${totalQty}</td>
                        <td>${total}</td>
                   </tr>`

        $('#orderDetail-tbody').append(data);
    });
}

