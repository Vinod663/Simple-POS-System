import {items_db, orders_db, customers_db} from "../db/db.js";
import OrderModel from "../model/OrderModel.js";

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
    addDataLabel()
});