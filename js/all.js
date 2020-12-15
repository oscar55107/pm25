let banner = document.querySelector('.banner');
let title = document.querySelector('.title');
let selectArea = document.querySelector(".selectArea");
let cardList = document.querySelector('.cardList');
let btnList = document.querySelector(".btnList");
const pageId = document.getElementById('pageId');

banner.style.height = window.innerHeight + "px";
window.onresize = function () {
    banner.style.height = window.innerHeight + "px";
}
let bannertext = document.getElementById("text");
const letters = ["P", "M", "2", ".", " 5",];
setTimeout(
    () =>
        letters.forEach((letter, i) => {
        setTimeout(() => {
            bannertext.innerHTML += letter;
      }, i * 500);
    }),
    1000
);

const xhr = new XMLHttpRequest();
xhr.open('get','https://data.epa.gov.tw/api/v1/aqx_p_02?limit=1000&api_key=9be7b239-557b-4c10-9775-78cadfc555e9&format=json',true);
xhr.send(null);
let data = [];
xhr.onload = function() {
    let alldata = JSON.parse(xhr.responseText).records;
    if(title.textContent!=="全台PM2.5"){
        for(let i = 0;i < alldata.length; i++){
            if(alldata[i].county === title.textContent){
                data.push(alldata);
            }
        }
    }else{
        data = alldata;
    }
    selectOption(); //載入選單
    updateList(data);//一開始載入全部
    pagination(data,1)
}
//監聽事件
selectArea.addEventListener('change',updateListSel);
btnList.addEventListener('click',updateListBtn)
pageId.addEventListener('click',switchPage)

let allZone = [];
function  selectOption() {
    for(let i = 0 ; i < data.length ; i++){
        allZone.push(data[i].county);  // 取出全部地區
    }
    const zoneName = new Set();
    const zoneList = data.filter(item => !zoneName.has(item.county)? zoneName.add(item.county):false);
    for( let i =0 ; i < zoneList.length ; i++){
        let addOption = document.createElement('option');
        addOption.textContent = zoneList[i].county;
        addOption.setAttribute('value',zoneList[i].county);
        selectArea.append(addOption);
    }
}

function updateList(data) {
    let str = "";
    let sty ;
    data.forEach((item) => {
        if (Number(item.PM25) < 12) {
            sty = 'rgba(64, 170, 2)';
        } else if (Number(item.PM25) >= 12 && Number(item.PM25) <= 35) {
            sty = 'rgb(255, 145, 0)';
        } else if (Number(item.PM25) > 35) {
            sty = 'rgb(150, 36, 1)';
        }
        str += `<div class="col-lg-6 col-12 mb-3">
                    <div class="card text-center  card--shadow  h-100">
                        <div class="card-header d-flex justify-content-between bg-secondary" id="head">
                            <h3 class="h5">${item.county}</h3>
                            <h3 class="h5">${item.Site}</h3>
                        </div>
                        <div class="card-body">
                            <strong class="pr-3" style="color:${sty}">PM2.5:
                                <span class="pmText">${item.PM25}</span>
                            </strong>
                        </div>
                        <div class="card-footer ">
                            <strong>觀測日期 : </strong> ${item.DataCreationDate}
                        </div>
                    </div>
                </div>
        `;
    });
    cardList.innerHTML =str;
}

function updateListSel(e) {
    let selectData = [];
    str = selectArea.value;
    title.textContent = str;
    for( let i = 0; i< data.length ;i++){
        if(e.target.value === data[i].county){
            selectData.push(data[i]);
        }
        else if(e.target.value==="全台灣"){
            selectData = data;
        }
    }
    updateList(selectData);
    pagination(selectData, 1);
}

function updateListBtn(e) {
    let target = e.target.nodeName;
    if (target !== 'A') {
        return
    } else {
        let selectData = [];
        str = e.target.textContent;//標題替換
        title.textContent = str;//標題替換
        for (let i = 0; i < data.length; i++) {
            if (str === data[i].county) {
                selectData.push(data[i]);
            }else if(str === "全台灣"){
                selectData = data;
                console.log(selectData);
            }       
        }
        updateList(selectData);
        pagination(selectData, 1)
    }
}

//分頁
function pagination(data,nowPage){
    const datatotal = data.length;
    const perPage = 10 ; //筆數
    const pageTotal = Math.ceil(datatotal / perPage);
    const currentPage = nowPage;
    const minData = (currentPage * perPage) - perPage + 1;
    const maxData = (currentPage * perPage);
    const newData = [];
    data.forEach((item, index) => {
        const num = index + 1;
        if( num >= minData && num <= maxData){
            newData.push(item);
        }
    })
    const page = {
        pageTotal,
        currentPage,
        hasPrevious : currentPage > 1,
        hasNext : currentPage < pageTotal,
    }
    updateList(newData);
    pageBtn(page);
}
function pageBtn(page) {
    let str = '';
    const total = page.pageTotal;
    if(page.hasPrevious){
        str += `<li class="page-item"><a class="page-link" href="#" data-page="${Number(page.currentPage)-1}"><</a></li>`
    }else{
        str += `<li class="page-item disabled"><a class="page-link" href="#"><</a></li>`
    }
    for (let i = 1; i <= total; i++) {
        if (Number(page.currentPage) === i) {
            str += `<li class="page-item active"><a class="page-link red" href="#" data-page="${i}">${i}</a></li>`;
        } else {
            str += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
    };
    if (page.hasNext) {
        str += `<li class="page-item"><a class="page-link" href="#" data-page="${Number(page.currentPage) + 1}">></a></li>`;
    } else {
        str += `<li class="page-item disabled"><span class="page-link">></span></li>`;
    }
    pageId.innerHTML = str;
}

function switchPage(e) {
    e.preventDefault();
    if (e.target.nodeName !== 'A') return;
    const page = e.target.dataset.page;
    let tempItem = [];
    if (title.textContent === "全台PM2.5" || title.textContent === "全台灣") {
        pagination(data, page);
    } else {
        for (let i = 0; i < data.length; i++) {
            if (data[i].county === title.textContent) {
                tempItem.push(data[i]);
            }
        }
        pagination(tempItem, page);
    }
}

