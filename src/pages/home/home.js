const upIco = '[-]';
const downIco = '[+]';
const hideIco = '&#10799;';
const dloadIco = '&#10515;';

const pageStructure = {
    stepOneExtract: {
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
    stepTwoTransform: {
        ERPSystem: {
            transformTransactionAmount: 'http://localhost:4040/transform/transactions'
        }
    },
    stepThreeLoad: {}
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

const hideToggle = (id, e) => {
    const el = document.getElementById(id);
    const titleEl = document.getElementById(`${id}Title`);

    if (e.target !== titleEl) return e.stopPropagation();

    for (const child of el.children) {
        child.classList.toggle('hide')
    }

    const icon = titleEl.innerText.includes(upIco) ? downIco : upIco;
    titleEl.innerHTML = `${getPascal(id)} &nbsp; &nbsp; ${icon}`;
    titleEl.classList.remove('hide');

    e.stopPropagation();

}

const toggleTableAndOptions = (key) => {
    const tableContainer = document.getElementById(key + 'Table');
    const optionsContainer = document.getElementById(key + 'Options');

    tableContainer.classList.toggle('hide');
    optionsContainer.classList.toggle('hide');
}

const showResults = async (url, key) => {
    const tableContainer = document.getElementById(key + 'Table');
    const optionsContainer = document.getElementById(key + 'Options');

    showLoader();
    const res = await fetch(url);
    const data = await res.json();
    hideLoader();

    tableContainer.innerHTML = ` Count: ${data.length}`;
    tableContainer.innerHTML += getTableFromObjectArray(data);

    tableContainer.classList.remove('hide');
    optionsContainer.classList.remove('hide');
}

const init = () => {

    const rescurse = (obj, div, key = "", level = 0) => {

        const pascalText = getPascal(key);

        if (typeof obj !== 'object') {
            const childDiv = document.createElement('div');
            childDiv.innerHTML = `
                <button onclick="showResults('${obj}', '${key}')">${pascalText}</button>
                <div id="${key}Options" class="hide" >
                    <span class="options">${dloadIco} Download</span>
                    <span class="options" onclick="toggleTableAndOptions('${key}')">${hideIco} Close</span> 
                </div>
                <div id="${key}Table" class="tableContainer hide"></div>
            `;
            div.appendChild(childDiv);
            return;
        } else {
            const childDiv = document.createElement('div');
            childDiv.id = key;
            childDiv.className = `accordion ${level > 1 ? 'hide' : ''}`;
            childDiv.innerHTML = pascalText ? `
                <div id="${key}Title" class="title">
                    ${pascalText} &nbsp; &nbsp; ${level > 1 ? upIco : downIco}
                </div>
            `: '';
            childDiv.onclick = (e) => hideToggle(key, e)
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
