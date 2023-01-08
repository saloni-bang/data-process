const crypto = require('crypto')

const products = [];

const vendors = [];

for (let i = 1; i < 101; i++) {
    products.push({
        product_id: 40000 + i,
        product_name: `product-${i}`,
        product_desc: `product-desc-${i}`,
        product_weight_kg: crypto.randomInt(1, 100),
        product_height_cm: crypto.randomInt(10, 200),
        product_width_cm: crypto.randomInt(10, 200)
    })
}

const CITY = ['UTTAH', 'SAN FRANSICO', 'MICHIGAN', 'MINEAPOLIS', 'NEW YORK', 'SAN JOSE']
for (let i = 1; i < 11; i++) {
    vendors.push({
        vendor_id: 50000 + i,
        vendor_name: `vendor-${i}`,
        vendor_address: `POST CODE: ${crypto.randomInt(1000, 4000)}, CITY: ${CITY[crypto.randomInt(0, 5)]}`
    })
}

const status = ['SUCCESS', 'PENDING', 'FAILED'];


const transaction = [];
for (let i = 1; i < 601; i++) {
    const ogDate = new Date('2021-01-01T00:00:00.000Z');
    ogDate.setDate(ogDate.getDate() + crypto.randomInt(1, 360));
    const transact = {
        transaction_id: 60000 + i,
        date: ogDate.toISOString().split('T')[0],
        transaction_status: status[crypto.randomInt(0, 2)],
        vendor_id: vendors[crypto.randomInt(0, 10)].vendor_id,
        product_id: products[crypto.randomInt(0, 100)].product_id,
        unit_price: crypto.randomInt(5, 15),
        currency: 'USD',
        total_units: crypto.randomInt(1, 68)
    }

    transaction.push(transact);
}

require('fs').writeFileSync(__dirname+'/srm.json', JSON.stringify({
    products,
    vendors,
    transaction
}));

