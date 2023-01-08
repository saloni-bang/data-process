const upIco = '[-]';
const downIco = '[+]';
const hideIco = '&#10799;';
const dloadIco = '&#10515;';

const delayProm = async (delayInMs) => {
    await new Promise((resolve) => setTimeout(() => resolve(), delayInMs))
}

const pageStructure = {
    "1: Extract": {
        erpSystem: {
            extractMaterials: 'http://localhost:4040/extract/materials',
            extractMaterialCosts: 'http://localhost:4040/extract/costs',
            extractBillOfMaterials: 'http://localhost:4040/extract/bill-of-materials',
            extractErpTransactions: 'http://localhost:4040/extract/transactions'
        },
        srmSystem: {
            extractProducts: 'http://localhost:3038/extract/products',
            extractVendors: 'http://localhost:3038/extract/vendors',
            extractTransactions: 'http://localhost:3038/extract/transactions'
        }
    },
    "2: Transform": {
        transformErp: {
            calculateErpTransactionCost: 'http://localhost:3090/transform-erp-transactions'
        },
        transformSrm: {
            calculateSrmTransactionCost: 'http://localhost:3090/transform-srm-transactions'
        }
    },
    "3: Load": {
        clearAll: 'http://localhost:3090/clear-all',
        loadErp: {
            initializeErpTables: 'http://localhost:3090/initialize-erp-tables',
            loadErpMaterials: 'http://localhost:3090/load-erp-materials',
            loadErpMaterialCosts: 'http://localhost:3090/load-erp-material-costs',
            loadErpBillOfMaterials: 'http://localhost:3090/load-erp-bill-of-materials',
            loadErpTransactions: 'http://localhost:3090/load-erp-transactions'
        },
        loadSrm: {
            initializeSrmTables: 'http://localhost:3090/initialize-srm-tables',
            loadSrmProducts: 'http://localhost:3090/load-srm-products',
            loadSrmVendors: 'http://localhost:3090/load-srm-vendors',
            loadSrmTransactions: 'http://localhost:3090/load-srm-transactions'
        }
    },
    "4: Analyze": {
        getMaterialProcurementVsSellingPrice: 'http://localhost:3090/material-proc-vs-sell'   
    }
}

const showLoader = () => {
    const loader = document.getElementById('loader');
    const spiner = document.getElementById('spiner');
    loader.style.height = `${document.body.clientHeight}px`;
    spiner.style.top = `${window.innerHeight / 2 - 20}px`;
    loader.classList.remove("hide");
}

const hideLoader = () => {
    const loader = document.getElementById('loader');
    if (!loader.classList.contains("hide")) {
        loader.classList.add('hide');
    }
}

const getTableFromObjectArray = (objArr) => {

    const tableHeaders = `
        <tr>
        ${Object.keys(objArr[0]).map(i => `<th>${i}</th>`).join(' ')}
        </tr>
    `;

    const tableRows = objArr.map(row => `
        <tr>
            ${Object.values(row).map(i => `<td>${i}</td>`).join(' ')}
        </tr>
    `).join('');

    return `<table>${tableHeaders}${tableRows}</table>`;
};

const getPascal = (input) => {
    return input
        // insert a space before all caps
        .replace(/([A-Z])/g, ' $1')
        // uppercase the first character
        .replace(/^./, function (str) { return str.toUpperCase(); })
}

const toggleCollapse = (id, e) => {
    const el = document.getElementById(id);
    const titleEl = document.getElementById(id + 'Title');
    const colapsibleIcon = document.getElementById(id + 'Icon')

    if (e.target !== titleEl && e.target !== colapsibleIcon) return e.stopPropagation();

    for (const child of el.children) {
        child.classList.toggle('hide');
    }

    colapsibleIcon.innerHTML = colapsibleIcon.innerText.includes(upIco) ? downIco : upIco;
    titleEl.classList.remove('hide');

    e.stopPropagation();

}

const closeResults = (key) => {
    const { classList } = document.getElementById(key + 'Results');
    if (!classList.contains('hide')) {
        classList.add('hide');
    }
}

const response200 = {};

const csvDownload = (key) => {
    const data = response200[key];
    const fields = Object.keys(data[0])
    const replacer = (key, value) => value === null ? '' : value;
    let csv = data.map((row) => {
        return fields.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
    })
    csv.unshift(fields.join(',')) // add header column
    csv = csv.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${key}.csv`;
    a.click();
}

const showResults = async (url, key) => {
    const resultContainer = document.getElementById(key + 'Results');

    showLoader();
    const res = await fetch(url);
    const result = await res.text();
    await delayProm(1200);
    hideLoader();

    if (res.status !== 200) {
        resultContainer.innerHTML = `
            <b style="color:red;">Error!</b>
            <span class="options" onclick="closeResults('${key}')">${hideIco} Close</span>
            <br/> ${result}`;
    } else {
        const data = JSON.parse(result);
        if (Array.isArray(data) && typeof data[0] == 'object') {
            response200[key] = data;
            resultContainer.innerHTML = `
                <b style="color:green;">Count: ${data.length} </b>
                <span class="options" onclick="closeResults('${key}')">${hideIco} Close</span>
                <span class="options" onclick="csvDownload('${key}')">${dloadIco} Download</span>
                <div class='tableContainer'> ${getTableFromObjectArray(data)} </div>`;
        } else {
            resultContainer.innerHTML = `
                <b style="color:green;">Success!</b>
                <span class="options" onclick="closeResults('${key}')">${hideIco} Close</span>
                <br/> ${result}`;
        }
    }

    resultContainer.classList.remove('hide');
}

const init = () => {

    const rescurse = (obj, div, key = "", level = 0) => {

        const pascalText = getPascal(key);

        if (typeof obj !== 'object') {
            const childDiv = document.createElement('div');
            childDiv.innerHTML = `
                <button onclick="showResults('${obj}', '${key}')">${pascalText}</button>
                <div id="${key}Results" class="resultContainer hide"></div>
            `;
            div.children[1].appendChild(childDiv);
            return;
        } else {
            const childDiv = document.createElement('div');
            childDiv.id = key;
            childDiv.className = `accordion ${level > 1 ? 'hide' : ''}`;
            childDiv.innerHTML = pascalText ? `
                <div id="${key}Title" class="title">
                    ${pascalText}
                    <span id="${key}Icon" class="collapsibleIcon">${downIco}</span>
                </div>
                <div id="${key}Content" class="hide"></div>
            `: '';
            childDiv.onclick = (e) => toggleCollapse(key, e)
            div.appendChild(childDiv);
            div = childDiv;
        }

        for (const key in obj) {
            rescurse(obj[key], div, key, level + 1)
        }
    }


    const parent = document.getElementById('main');

    rescurse(pageStructure, parent);

}
