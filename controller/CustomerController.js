import {customers_db} from "../db/db.js";
import CustomerModel from "../model/CustomerModel.js";

let selectedCustomerId = null;
let selectedCustomerName = null;

//load customer data from localStorage
const savedCustomers= localStorage.getItem("customer_data");
if (savedCustomers) {
    customers_db.push(...JSON.parse(savedCustomers));//...->spread operator(spreads out all the items from an array one by one.), JSON.parse() = Convert text back to array
}
loadCustomerTable();
loadCustomersToComboBox();
addDataLabel();
$('#totalCustomerCount').text(customers_db.length);

//load customer table
function loadCustomerTable() {
    $('#customer-tbody').empty();
    customers_db.map((customer, index) => {
        let id = customer.customer_id;
        let name = customer.customer_name;
        let email = customer.customer_email;
        let phone = customer.customer_phone;

        let data = `<tr>
                        <td>${id}</td>
                        <td>${name}</td>
                        <td>${email}</td>
                        <td>${phone}</td>
                   </tr>`

        $('#customer-tbody').append(data);
    });

    //Row selection
    $('#customer-tbody').on('click', 'tr', function(){
        $('#customer-tbody tr').removeClass('table-active'); // clear previous selection
        $(this).addClass('table-active'); // highlight selected row

        selectedCustomerId = $(this).find('td:eq(0)').text().trim();
        selectedCustomerName = $(this).find('td:eq(1)').text().trim();
        console.log("Row selected");
        console.log(selectedCustomerId);
        console.log(selectedCustomerName);
    });


}


//save customer
$('#saveCustomerBtn').on('click', function(){
    let id = $('#customerId').val().trim();
    let name = $('#customerName').val().trim();
    let email = $('#customerEmail').val().trim();
    let phone = $('#phone').val().trim();

    $('#custIdError').text('');
    $('#customerId').css('border-color', '');
    $('#custNameError').text('');
    $('#customerName').css('border-color', '');
    $('#custEmailError').text('');
    $('#customerEmail').css('border-color', '');
    $('#custPhoneError').text('');
    $('#phone').css('border-color', '');
    let hasError = false;

    if (id === '' || name === '' || email === '' || phone === '') {
        /*const CustomerModal = $('#newCustomerModal');
        CustomerModal.modal('hide');*/
        Swal.fire({
            title: 'Error!',
            text: 'Invalid Inputs! Fill all fields',
            icon: 'error',
            confirmButtonText: 'Ok'
        })
        return;
    }

    // Validate ID (format: C001)
    if (!/^C\d{3}$/.test(id)) {
        $('#custIdError').text('ID must be like C001');
        $('#customerId').css('border-color', 'red');
        hasError = true;
    }

    // Validate Name (only letters and spaces, min 3 chars)
    if (!/^[A-Za-z\s]{3,30}$/.test(name)) {
        $('#custNameError').text('Name must be 3–30 letters only');
        $('#customerName').css('border-color', 'red');
        hasError = true;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $('#custEmailError').text('Enter a valid email');
        $('#customerEmail').css('border-color', 'red');
        hasError = true;
    }

    if (!/^\+947\d{8}$/.test(phone)) {
        $('#custPhoneError').text('Use +94 format (e.g., +94712345678)');
        $('#phone').css('border-color', 'red');
        hasError = true;
    }

    if (hasError) return;

    // Check for duplicate ID(.some() is a special JavaScript method. It Looks through each item (we call it customer here))
    const exists = customers_db.some(customer => customer.customer_id === id);
    if (exists) {
        Swal.fire({
            title: 'Duplicate ID!',
            text: 'Customer ID already exists.',
            icon: 'warning',
            confirmButtonText: 'Ok'
        });
        return;
    }

    let customer_data = new CustomerModel(id, name, email, phone);
    customers_db.push(customer_data);

    localStorage.setItem("customer_data", JSON.stringify(customers_db));//save to localStorage

    console.log(customers_db);
    loadCustomerTable();
    $('#totalCustomerCount').text(customers_db.length);
    loadCustomersToComboBox();
    clearCustomerFields();
    addDataLabel();
    Swal.fire({
        title: "Added Successfully!",
        icon: "success",
        draggable: true
    });
});

//update customer
$('#updateCustomerBtn').on('click', function(){
    if (selectedCustomerId === null) {
        Swal.fire({
            title: 'Error!',
            text: 'Please select a customer to update.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }
    $('#updateCustNameError').text('');
    $('#updateCustomerName').css('border-color', '');
    $('#updateCustEmailError').text('');
    $('#updateCustomerEmail').css('border-color', '');
    $('#updateCustPhoneError').text('');
    $('#updatePhone').css('border-color', '');

    // Show modal and fill in customer info
    const customer = customers_db.find(customer => customer.customer_id === selectedCustomerId);
    $('#updateCustomerId').val(customer.customer_id);
    $('#updateCustomerName').val(customer.customer_name);
    $('#updateCustomerEmail').val(customer.customer_email);
    $('#updatePhone').val(customer.customer_phone);

    //show modal
    $('#updateCustomerModal').modal('show');
});

//confirm update
$('#confirmUpdateBtn').on('click', function(){
    const id = $('#updateCustomerId').val().trim();
    const name = $('#updateCustomerName').val().trim();
    const email = $('#updateCustomerEmail').val().trim();
    const phone = $('#updatePhone').val().trim();

    $('#updateCustNameError').text('');
    $('#updateCustomerName').css('border-color', '');
    $('#updateCustEmailError').text('');
    $('#updateCustomerEmail').css('border-color', '');
    $('#updateCustPhoneError').text('');
    $('#updatePhone').css('border-color', '');
    let hasError = false;

    if (id === '' || name === '' || email === '' || phone === '') {
        Swal.fire({
            title: 'Error!',
            text: 'Invalid Inputs! Fill all fields',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    // Validate Name (only letters and spaces, min 3 chars)
    if (!/^[A-Za-z\s]{3,30}$/.test(name)) {
        $('#updateCustNameError').text('Name must be 3–30 letters only');
        $('#updateCustomerName').css('border-color', 'red');
        hasError = true;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        $('#updateCustEmailError').text('Enter a valid email');
        $('#updateCustomerEmail').css('border-color', 'red');
        hasError = true;
    }

    if (!/^\+947\d{8}$/.test(phone)) {
        $('#updateCustPhoneError').text('Use +94 format (e.g., +94712345678)');
        $('#updatePhone').css('border-color', 'red');
        hasError = true;
    }

    if (hasError) return;

    // Update customer data
    const index = customers_db.findIndex(customer => customer.customer_id === selectedCustomerId);
    if (index !== -1) {
        customers_db[index].customer_id = id;
        customers_db[index].customer_name = name;
        customers_db[index].customer_email = email;
        customers_db[index].customer_phone = phone;

        localStorage.setItem("customer_data", JSON.stringify(customers_db));//update the localStorage
        loadCustomerTable();
        $('#totalCustomerCount').text(customers_db.length);
        loadCustomersToComboBox();
        $('#updateCustomerModal').modal('hide');
        $('#searchCustomerBar').val('');

        Swal.fire({
            title: "Updated Successfully!",
            icon: "success",
            draggable: true
        });
    }
    else {
        Swal.fire({
            title: 'Error!',
            text: 'Customer not found.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
    }
    addDataLabel();
});


//delete customer
$('#deleteCustomerBtn').on('click', function(){
    if (selectedCustomerId === null) {
        Swal.fire({
            title: 'Error!',
            text: 'Please select a customer to delete.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        $('#deleteCustomerModal').modal('hide');
        return;
    }

    // Show modal and fill in customer info
    $('#deleteCustomerId').text(selectedCustomerId);
    $('#deleteCustomerName').text(selectedCustomerName);

    //show modal
    $('#deleteCustomerModal').modal('show');

});


//confirm delete
$('#confirmDeleteBtn').on('click', function(){
    const index = customers_db.findIndex(customer => customer.customer_id === selectedCustomerId);
    if (index !== -1) {
        customers_db.splice(index, 1);
        localStorage.setItem("customer_data", JSON.stringify(customers_db));//save to localStorage
        loadCustomerTable();
        $('#totalCustomerCount').text(customers_db.length);
        loadCustomersToComboBox();

        Swal.fire({
            title: "Deleted Successfully!",
            icon: "success",
            draggable: true
        });
    }
    $('#deleteCustomerModal').modal('hide');
    $('#searchCustomerBar').val('');
    addDataLabel();
});


function clearCustomerFields() {
    $('#customerId').val('');
    $('#customerName').val('');
    $('#customerEmail').val('');
    $('#phone').val('');
}


//search customer
$('#customerSearchBtn').on('click', function () {
    const searchTerm = $('#searchCustomerBar').val().trim().toLowerCase();

    if (searchTerm === '') {
        Swal.fire({
            title: 'Error!',
            text: 'Please enter a search term.',
            icon: 'error',
            confirmButtonText: 'Ok'
        });
        return;
    }

    const filterType = $('#customerFilterCombo').val();
    let filteredCustomers = [];

    if (filterType === 'Name') {
        filteredCustomers = customers_db.filter(customer =>
            customer.customer_name.toLowerCase().includes(searchTerm)
        );
    } else if (filterType === 'Email') {
        filteredCustomers = customers_db.filter(customer =>
            customer.customer_email.toLowerCase().includes(searchTerm)
        );
    } else if (filterType === 'Phone') {
        filteredCustomers = customers_db.filter(customer =>
            customer.customer_phone.toLowerCase().includes(searchTerm)
        );
    }

    if (filteredCustomers.length === 0) {
        Swal.fire({
            title: 'No Results!',
            text: 'No customers found matching that search term.',
            icon: 'info',
            confirmButtonText: 'Ok'
        });
        return;
    }

    // Clear current table
    $('#customer-tbody').empty();

    const headers = [];
    $('#customerTable th').each(function () {
        headers.push($(this).text());
    });

    // Load only filtered customers
    filteredCustomers.forEach(customer => {
        const row = `
           
            <tr>
            <td data-label="${headers[0]}">${customer.customer_id}</td>
            <td data-label="${headers[1]}">${customer.customer_name}</td>
            <td data-label="${headers[2]}">${customer.customer_email}</td>
            <td data-label="${headers[3]}">${customer.customer_phone}</td>
            </tr>
        `;
        $('#customer-tbody').append(row);
    });


});


//reset button action
$('#resetFieldsBtn').on('click', function(){
    $('#searchCustomerBar').val('');
    $('#customerFilterCombo').val('Name');
    loadCustomerTable();
    $('#totalCustomerCount').text(customers_db.length);
    addDataLabel();

});


//add data-label attribute to each cell
/*const headers = document.querySelectorAll('#customerTable th');
const rows = document.querySelectorAll('#customer-tbody tr');

rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, index) => {
        if (headers[index]) {
            cell.setAttribute('data-label', headers[index].innerText);
        }
    });
});*/

function addDataLabel(){
    const headers = document.querySelectorAll('#customerTable th');
    const rows = document.querySelectorAll('#customer-tbody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            if (headers[index]) {
                cell.setAttribute('data-label', headers[index].innerText);
            }
        });
    });
}

function loadCustomersToComboBox(){
    $('#customerSelect').empty();
    customers_db.map((customer, index) => {
        let id = customer.customer_id;
        let name = customer.customer_name;

        let data = `<option value="${id}">${name}</option>
                    <option value="" selected disabled hidden>Select Customer</option>
                    `

        $('#customerSelect').append(data);
        $('#customerUpdate').append(data);
    });
}

$('#customerSelect').on('change', function(){
    const selectedCustomerId = $(this).val();
    const selectedCustomer = customers_db.find(customer => customer.customer_id === selectedCustomerId);

    if (selectedCustomer) {
        $('#selectCustomerID').val(selectedCustomer.customer_id);
        $('#SelectCustomerEmail').val(selectedCustomer.customer_email);
        $('#SelectCustomerPhone').val(selectedCustomer.customer_phone);
    } else {
        $('#selectCustomerID').val('');
        $('#SelectCustomerEmail').val('');
        $('#SelectCustomerPhone').val('');
    }
});






