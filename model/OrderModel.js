export default class OrderModel {
    constructor(ord_id, cust_id, cust_name, cust_email, cust_phone, ord_date, ord_items=[], total_amount,subtotal,cash,change,discount,discount_type) {
        this.order_id = ord_id;
        this.customer_id = cust_id;
        this.customer_name = cust_name;
        this.customer_email = cust_email;
        this.customer_phone = cust_phone;
        this.order_date = ord_date;
        this.order_items = ord_items;

        this.total_order_amount = total_amount;
        this.order_subtotal = subtotal;
        this.order_cash = cash;
        this.order_change = change;
        this.order_discount = discount;
        this.order_discount_type = discount_type;


    }
}