import {items_db, orders_db} from "../db/db.js";
import OrderModel from "../model/OrderModel.js";

const orderItems = [];
let fullTotal = 0;
let subTotal=0

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
