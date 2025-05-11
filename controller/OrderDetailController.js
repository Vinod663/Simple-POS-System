import {items_db, orders_db, customers_db} from "../db/db.js";
import OrderModel from "../model/OrderModel.js";

let selectedOrderId = null;

orders_db.length = 0; // Clear the orders_db array
const savedOrders= localStorage.getItem("order_data");
if (savedOrders) {
    orders_db.push(...JSON.parse(savedOrders));//...->spread operator(spreads out all the items from an array one by one.), JSON.parse() = Convert text back to array
}
loadOrderDetailTable();
addDataLabel();

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

//search Order
$('#orderSearchBtn').on('click', function() {
    const searchTerm = $('#searchOrderBar').val().toLowerCase();

    if (searchTerm === '') {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a search term.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    const filterOption= $('#orderFilterCombo').val();
    let filteredOrders = [];

    if(filterOption === 'Order-ID') {
        filteredOrders = orders_db.filter(order =>
            order.order_id.toString().toLowerCase().includes(searchTerm)
        );
    }
    else if(filterOption === 'Customer-Name') {
        filteredOrders = orders_db.filter(order =>
            order.customer_name.toString().toLowerCase().includes(searchTerm)
        );
    }
    else if(filterOption==='Date'){
        filteredOrders = orders_db.filter(order =>
            order.order_date.toString().toLowerCase().includes(searchTerm)
        );
    }

    if (filteredOrders.length === 0) {
        Swal.fire({
            title: 'Error!',
            text: 'No orders found',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    $('#orderDetail-tbody').empty();

    const headers = [];
    $('#orderDetailTable th').each(function() {
        headers.push($(this).text());
    });



    filteredOrders.forEach(order => {
        let items = order.order_items;
        let totalQty = items.reduce((sum, items) => sum + parseInt(items.itemQty), 0);
        const rows = `
            <tr>
                <td data-label="${headers[0]}">${order.order_id}</td>
                <td data-label="${headers[1]}">${order.customer_id}</td>
                <td data-label="${headers[2]}">${order.customer_name}</td>
                <td data-label="${headers[3]}">${order.order_date}</td>
                <td data-label="${headers[4]}">${totalQty}</td>
                <td data-label="${headers[5]}">${order.total_order_amount}</td>
            </tr>`;

        $('#orderDetail-tbody').append(rows);
    });
});

//reset button order
$('#orderResetBtn').on('click', function() {
    $('#searchOrderBar').val('');
    $('#orderFilterCombo').val('Order-ID');
    loadOrderDetailTable();
    addDataLabel();
});


//Row selection
$('#orderDetailTable').on('click', 'tr', function() {
    $('#orderDetail-tbody tr').removeClass('table-active');
    $(this).addClass('table-active');

    selectedOrderId = $(this).find('td:eq(0)').text().trim();
    console.log("Row selected:", selectedOrderId);

});

//Delete Order
$('#deleteOrderBtn').on('click', function() {
    if (selectedOrderId === null) {
        Swal.fire({
            title: 'Error!',
            text: 'Please select an order to delete.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        $('#deleteOrderModal').modal('hide');
        return;
    }
    $('#deleteOrderId').text(selectedOrderId);
    $('#deleteOrderModal').modal('show');
});

//confirm delete order
$('#confirmDeleteOrderBtn').on('click', function() {
    const orderIndex = orders_db.findIndex(order => order.order_id === selectedOrderId);
    if (orderIndex !== -1) {
        restoreItemQty(orders_db[orderIndex].order_items);
        orders_db.splice(orderIndex, 1);
        localStorage.setItem("order_data", JSON.stringify(orders_db));
        loadOrderDetailTable();
        addDataLabel();
        loadItemTable();
        loadItemToComboBox();
        Swal.fire({
            title: 'Success!',
            text: 'Order deleted successfully.',
            icon: 'success',
            confirmButtonText: 'Ok'
        });
    }
    else {
        Swal.fire({
            title: 'Error!',
            text: 'Order not found.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    }
    $('#deleteOrderModal').modal('hide');
});

function restoreItemQty(items) {
    items.forEach(item => {
        const itemIndex = items_db.findIndex(i => i.item_id === item.itemId);
        if (itemIndex !== -1) {
            items_db[itemIndex].item_qty = parseInt(items_db[itemIndex].item_qty) + parseInt(item.itemQty);
        }
    });
    localStorage.setItem("item_data", JSON.stringify(items_db));
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

function loadItemToComboBox(){
    $('#itemSelect').empty();
    items_db.map((item, index) => {
        let id = item.item_id;
        let name = item.item_name;

        let data = `<option value="${id}">${name}</option>
                           <option value="" selected disabled hidden>Select item</option>
                          `

        $('#itemSelect').append(data);

    });
}