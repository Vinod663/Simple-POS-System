import {items_db} from "../db/db.js";
import ItemModel from "../model/ItemModel.js";

let selectedItemId=null;
let selectedItemName=null;

//load item data from localStorage
const savedItems= localStorage.getItem("item_data");
if (savedItems) {
    items_db.push(...JSON.parse(savedItems));//...->spread operator(spreads out all the items from an array one by one.), JSON.parse() = Convert text back to array
}
loadItemTable();

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

    //Row selection
    $('#item-tbody').on('click', 'tr', function(){
        $('#item-tbody tr').removeClass('table-active'); // clear previous selection
        $(this).addClass('table-active'); // highlight selected row

        selectedItemId = $(this).find('td:eq(0)').text().trim();
        selectedItemName = $(this).find('td:eq(1)').text().trim();
        console.log("Row selected");
        console.log(selectedItemId);
        console.log(selectedItemName);
    });


}

//save item
$('#saveItemBtn').on('click', function(){
    let id = $('#itemId').val();
    let name = $('#itemName').val();
    let category = $('#ItemCategory').val();
    let qty = $('#itemQty').val();
    let price = $('#itemSavePrice').val();

    if (id === '' || name === '' || category === '' || qty === '' || price === '') {
        Swal.fire({
            title: 'Error!',
            text: 'Invalid Inputs',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return
    }

    const exits=items_db.find(item => item.item_id === id);
    if (exits) {
        Swal.fire({
            title: 'Error!',
            text: 'Item ID already exists',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    let item_data=new ItemModel(id, name, category, qty, price);
    items_db.push(item_data);

    localStorage.setItem("item_data", JSON.stringify(items_db));//save to localStorage

    console.log(items_db);
    loadItemTable();
    clearItemFields();
    Swal.fire({
        title: "Added Successfully!",
        icon: "success",
        draggable: true
    });

});

function clearItemFields(){
    $('#itemId').val('');
    $('#itemName').val('');
    $('#ItemCategory').val('');
    $('#itemQty').val('');
    $('#itemSavePrice').val('');
}

//update item
$('#updateItemBtn').on('click', function(){
    if (selectedItemId === null) {
        Swal.fire({
            title: 'Error!',
            text: 'Please select an item to update.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    // Show modal and fill in item info
    const item = items_db.find(item => item.item_id === selectedItemId);
    $('#updateItemId').val(item.item_id);
    $('#updateItemName').val(item.item_name);
    $('#updateItemCategory').val(item.item_category);
    $('#updateQuantity').val(item.item_qty);
    $('#updatePrice').val(item.item_price);

    //show modal
    $('#updateItemModal').modal('show');
});

//confirm update
$('#confirmItemUpdateBtn').on('click', function(){
    const id = $('#updateItemId').val();
    const name = $('#updateItemName').val();
    const category = $('#updateItemCategory').val();
    const qty = $('#updateQuantity').val();
    const price = $('#updatePrice').val();

    if (id === '' || name === '' || category === '' || qty === '' || price === '') {
        Swal.fire({
            title: 'Error!',
            text: 'Invalid Inputs',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    //Update item data
    const itemIndex = items_db.findIndex(item => item.item_id === selectedItemId);
    if (itemIndex !== -1) {
        items_db[itemIndex].item_id = id;
        items_db[itemIndex].item_name = name;
        items_db[itemIndex].item_category = category;
        items_db[itemIndex].item_qty = qty;
        items_db[itemIndex].item_price = price;

        localStorage.setItem("item_data", JSON.stringify(items_db));//save to localStorage
        loadItemTable();
        $('#updateItemModal').modal('hide');
        $('#searchItemBar').val('');
        Swal.fire({
            title: "Updated Successfully!",
            icon: "success",
            draggable: true
        });
    }
    else {
        Swal.fire({
            title: 'Error!',
            text: 'Item not found',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    }
});

//delete item
$('#deleteItemBtn').on('click', function() {
    if (selectedItemId === null) {
        Swal.fire({
            title: 'Error!',
            text: 'Please select an item to delete.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        $('#deleteItemModal').modal('hide');
        return;
    }
    $('#deleteItemId').text(selectedItemId);
    $('#deleteItemName').text(selectedItemName);

    //show modal
    $('#deleteItemModal').modal('show');
});

//confirm delete
$('#confirmItemDeleteBtn').on('click', function() {
    const itemIndex = items_db.findIndex(item => item.item_id === selectedItemId);
    if (itemIndex !== -1) {
        items_db.splice(itemIndex, 1); // remove the item from the array
        localStorage.setItem("item_data", JSON.stringify(items_db));//save to localStorage
        loadItemTable();

        Swal.fire({
            title: "Deleted Successfully!",
            icon: "success",
            draggable: true
        });
        $('#deleteItemModal').modal('hide');
        $('#searchItemBar').val('');
    }
});

//Search item
$('#itemSearchBtn').on('click', function() {
    const searchTerm= $('#searchItemBar').val().toLowerCase();

    if (searchTerm === '') {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a search term.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }
    const filterOption = $('#itemFilterCombo').val();
    let filteredItems = [];

    if (filterOption === 'Name') {
        filteredItems = items_db.filter(item =>
            item.item_name.toLowerCase().includes(searchTerm)
        );
    }
    else if (filterOption === 'Category') {
        filteredItems = items_db.filter(item =>
            item.item_category.toLowerCase().includes(searchTerm)
        );
    }
    else if(filterOption === 'ID') {
        filteredItems = items_db.filter(item =>
            item.item_id.toString().includes(searchTerm)
        );
    }
    if (filteredItems.length === 0) {
        Swal.fire({
            title: 'Error!',
            text: 'No items found',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    $('#item-tbody').empty();

    const headers=[];
    $('#itemTable th').each(function() {
        headers.push($(this).text());
    });

    filteredItems.forEach(item => {
        const rows = `
            <tr>
             <td data-label="${headers[0]}">${item.item_id}</td>
             <td data-label="${headers[1]}">${item.item_name}</td>
             <td data-label="${headers[2]}">${item.item_category}</td>
             <td data-label="${headers[3]}">${item.item_qty}</td>
             <td data-label="${headers[4]}">${item.item_price}</td>
            </tr>
        `;
        $('#item-tbody').append(rows);
    })
});



//reset button item
$('#itemResetBtn').on('click', function(){
    $('#searchItemBar').val('');
    $('#itemFilterCombo').val('Name');
    loadItemTable();

    const headers = document.querySelectorAll('#itemTable th');
    const rows = document.querySelectorAll('#itemTable tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            if (headers[index]) {
                cell.setAttribute('data-label', headers[index].innerText);
            }
        });
    });

});


//add data-label attribute to each cell
const headers = document.querySelectorAll('#itemTable th');
const rows = document.querySelectorAll('#itemTable tr');

rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, index) => {
        if (headers[index]) {
            cell.setAttribute('data-label', headers[index].innerText);
        }
    });
});
