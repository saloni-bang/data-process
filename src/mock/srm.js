const COMM_PRODUCT = {
    product_id: "123",
    prduct_type: "OB" // outer body
}

const COMC_PR_TYPE = {
    product_type: "OB",
    struckname: "Z_OUTER_BODY_PART"
}
const Z_OUTER_BODY_PART = {
    name: "",
    description: "",
    weight: "",
    height: "",
    width: ""
}

const VENMAP = {
   vendor_id: "" ,
   vendor_name: "",
   vendor_details: "",
   vendor_address: ""
}
const Z_PROCUREMENT_TRNSACTIONS = {
    date: "",
    transaction_id: "",
    transaction_status: "",
    vendor_id: "",
    product_id: "",
    unit_price: "",
    currency: "",
    total_units: ""
}

const crypto = require('crypto')

const products = [];

const vendors = [];

for(let i=1; i < 101; i++){
    products.push({
        product_name: `product-${i}`,
        product_desc: `product-desc-${i}`,
        product_id: crypto.randomUUID(),
        product_weight_kg: crypto.randomInt(1,100),
        product_height_cm: crypto.randomInt(10, 200),
        product_width_cm: crypto.randomInt(10, 200)
    })
}

const CITY = ['UTTAH', 'SAN FRANSICO', 'MICHIGAN', 'MINEAPOLIS', 'NEW YORK', 'SAN JOSE']
for(let i=1; i < 11; i++){
    vendors.push({
        vendor_name: `vendor-${i}`,
        vendor_id: crypto.randomUUID(),
        vendor_address: `POST CODE: ${crypto.randomInt(1000, 4000)}, CITY: ${CITY[crypto.randomInt(0,5)]}`
    })
}

const status = ['SUCCESS', 'PENDING', 'FAILED'];


const transaction = [];
for(let i = 1; i < 601; i++) {
    const ogDate =  new Date('2021-01-01T00:00:00.000Z');
    ogDate.setDate(ogDate.getDate() + crypto.randomInt(1, 360));
    const transact = {
        date: ogDate.toISOString().split('T')[0],
        transaction_id: crypto.randomUUID(),
        transaction_status: status[crypto.randomInt(0,2)],
        vendor_id: vendors[crypto.randomInt(0,10)].vendor_id,
        product_id: products[crypto.randomInt(0,100)].product_id,
        unit_price: crypto.randomInt(40, 250),
        currency: 'USD',
        total_units: crypto.randomInt(1, 68)
    }

    transaction.push(transact);
}

require('fs').writeFileSync('./srm.json', JSON.stringify({
    products,
    vendors,
    transaction
}));

