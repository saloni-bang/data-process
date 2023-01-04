const k = require('./srm.json');
const crypto = require('crypto');

const Z_MARA = {
    matnr: "",
    matnr_desc: "",
    }
const Z_MARA_COST = {
    matnr: "",
    unit_price: "",
    currency: ""
}

const Z_BOM = {
    matnr: "",
    bom_id: "",
    product_id: "",
    product_units: ""
}

const Z_SALES = {
    date: "",
    transaction_id: "",
    transaction_status: "",
    matnr: "",
    units: ""
}

const materials = [];

for(let i = 1; i<21; i++) {
    materials.push({
        matnr: crypto.randomInt(10000000000, 12000000000),
        matnr_desc: `material-desc-${i}`
    })
}

const maraCosts = [];

for(let i = 1; i < 21; i++){
    maraCosts.push({
        matnr: materials[i-1].matnr,
        unit_price: crypto.randomInt(30,500),
        currency: 'USD'
    })
}

const bom = [];

for(let i = 1; i < 81; i++) {
    bom.push({
        matnr: materials[crypto.randomInt(0, 20)].matnr,
        bom_id: crypto.randomUUID(),
        product_id: k.products[crypto.randomInt(0,100)].product_id,
        product_units: crypto.randomInt(1, 6)
    })
}

const transaction = [];
const status = ['SUCCESS', 'PENDING', 'FAILED'];
for(let i = 1; i < 501; i++) {
    const ogDate =  new Date('2021-01-01T00:00:00.000Z');
    ogDate.setDate(ogDate.getDate() + crypto.randomInt(1, 360));
    const transact = {
        date: ogDate.toISOString().split('T')[0],
        transaction_id: crypto.randomUUID(),
        transaction_status: status[crypto.randomInt(0,2)],
        matnr: materials[crypto.randomInt(0,20)].matnr,
        units: crypto.randomInt(0, 30)
    }

    transaction.push(transact);
}

require('fs').writeFileSync('./erp.json', JSON.stringify({
    materials,
    maraCosts,
    bom,
    transaction
}));