import {customers_db} from "../db/db.js";
import CustomerModel from "../model/CustomerModel.js";

const savedCustomers= localStorage.getItem("customer_data");
if (savedCustomers) {
    customers_db.push(...JSON.parse(savedCustomers));
}
loadCustomerTable();

//load customer table
function loadCustomerTable() {
    $('#customer-tbody').empty();
    customers_db.map((customer,index) => {
        let name = customer.customer_name;
        let email = customer.customer_email;
        let phone = customer.customer_phone;

        let data = `<tr>
                        <td>${index+1}</td>
                        <td>${name}</td>
                        <td>${email}</td>
                        <td>${phone}</td>
                   </tr>`

        $('#customer-tbody').append(data);
    });
}




