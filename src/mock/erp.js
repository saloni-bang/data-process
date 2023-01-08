const k = require('./srm.json');
const crypto = require('crypto');

const materials = [];

for(let i = 1; i<21; i++) {
    materials.push({
        matnr: 10000 + i,
        matnr_desc: `material-desc-${i}`
    })
}

const maraCosts = [];

for(let i = 1; i < 21; i++){
    maraCosts.push({
        matnr: materials[i-1].matnr,
        unit_price: crypto.randomInt(400,500),
        currency: 'USD'
    })
}

const bom = [];

for(let i = 1; i < 81; i++) {
    bom.push({
        bom_id: 20000 + i,
        matnr: materials[crypto.randomInt(0, 20)].matnr,
        product_id: k.products[crypto.randomInt(0,100)].product_id,
        product_units: crypto.randomInt(1, 5)
    })
}

const transaction = [];
const status = ['SUCCESS', 'PENDING', 'FAILED'];
for(let i = 1; i < 501; i++) {
    const ogDate =  new Date('2021-01-01T00:00:00.000Z');
    ogDate.setDate(ogDate.getDate() + crypto.randomInt(1, 360));
    const transact = {
        transaction_id: 30000 + i,
        date: ogDate.toISOString().split('T')[0],
        transaction_status: status[crypto.randomInt(0,2)],
        matnr: materials[crypto.randomInt(0,20)].matnr,
        units: crypto.randomInt(0, 30)
    }

    transaction.push(transact);
}

require('fs').writeFileSync(__dirname+'/erp.json', JSON.stringify({
    materials,
    maraCosts,
    bom,
    transaction
}));