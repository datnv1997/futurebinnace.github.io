const vols = [];
const allSymbols = [];
const indexLastestPriceOrClose = 4;
const indexVol = 5;
const indexOldPrice = 1 // price open time
const indexLowestPrice = 3;
const indexHighestPrice = 2;
const setting = {
  sidewayPrice: 3,
  volatilityVol: 10
}


function main() {
  fetch('https://fapi.binance.com/fapi/v1/ticker/price')
    .then((response) => response.json())
    .then((data) => {
      data.filter(item => {
        if (!allSymbols.includes(item.symbol) && item.symbol.includes("USDT"))
          allSymbols.push(item.symbol)
        })

      const combineData = [];
      Promise.all(allSymbols.map(async symbol => {
        const resp = await getDataCoin(symbol, localStorage.getItem("futureTime") || "1m")
        return resp.json();
      })).then(allResult => {
        allResult.forEach((dataDetailCoin, index) => {
          let currentCandleStick = dataDetailCoin.reverse()[0];
          const dataHighestVol = getDataHighestVol(dataDetailCoin);
          combineData.push({
            coinName: allSymbols[index],
            oldPrice: parseFloat(currentCandleStick[indexOldPrice]),
            lastetPrice: parseFloat(currentCandleStick[indexLastestPriceOrClose]),
            percentChange: `${calculateChangePercentPrice(parseFloat(currentCandleStick[indexLastestPriceOrClose]), parseFloat(currentCandleStick[indexOldPrice]))}%`,
            isVolatilityVol: checkVolatilityVol(dataDetailCoin),
            timeVolatilityVol: checkVolatilityVol(dataDetailCoin) ? moment(dataHighestVol[0]).format("HH:mm:ss") : "",
            timeVolatilityVolFromNow: checkVolatilityVol(dataDetailCoin) ? moment(dataHighestVol[0]).fromNow() : "",
            sideway: checkSideway(dataDetailCoin)
          })
        })

        $(".render-item").empty();
        combineData.forEach(item => {
          $(".render-item").append(bindingData(item))
        })
      }
      )
    })
}

setInterval(() => {
  main();
  initPage();
}, 4000);
function initPage() {
  $("#futureTimeSelect").val(localStorage.getItem("futureTime"));
}

function changeFutureTime() {
  var value = document.getElementById("futureTimeSelect").value;
  localStorage.setItem("futureTime", value);
  window.location.reload();
}

function calculateChangePercentPrice(currentPrice, oldPrice) {
  return ((currentPrice - oldPrice) / currentPrice) * 100.0;
}

function bindingData(data) {
  const isVolatilityVol  = data.isVolatilityVol;
  return `
  <tr>
    <td>${data.coinName}</td>
    <td>${data.oldPrice}</td>
    <td>${data.lastetPrice}</td>
    <td>${data.percentChange}</td>
    <td style="${isVolatilityVol ? 'color: green; font-weight: bold': ''}">${isVolatilityVol ? "Có" : "Không"}</td>
    <td>${data.timeVolatilityVol}</td>
    <td>${data.timeVolatilityVolFromNow}</td>
    <td style="${data.sideway ? 'color: green; font-weight: bold': ''}">${data.sideway? "Có" : "Không"}</td>
  </tr>
  `
}


async function getDataCoin(symbol, interval) {
  return fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=15`)
}
// getDataCoin("MKRUSDT", "1h").then((response) => response.json())
// .then((data) => {
//   const dataFormat = data.reverse()
//   console.log("data", dataFormat);
//   checkSideway(dataFormat)
// })

function checkVolatilityVol(dataCoin) {
  let data = dataCoin.reverse();
  const highestVol = data.map(item => parseFloat(item[indexVol])).sort(function (a, b) { return b - a })[0];
  let lowestVol = data.map(item => parseFloat(item[indexVol])).sort(function (a, b) { return a - b })[1];
  const currentVol = parseFloat(data[0][indexVol]);
  let isVolatility = false;

  // if (currentVol < lowestVol) {
  //   lowestVol = data.map(item => parseFloat(item[indexVol])).sort(function (a, b) { return a - b })[1];
  // }
  if (highestVol > lowestVol * setting.volatilityVol) isVolatility = true

  return isVolatility
}

function getDataHighestVol(dataCoin) {
  return dataCoin.sort(function (a, b) { return parseFloat(b[indexVol]) - parseFloat(a[indexVol]) })[0];
}
function getDataHighestPrice(dataCoin) {
  return dataCoin.sort(function (a, b) { return parseFloat(b[indexHighestPrice]) - parseFloat(a[indexHighestPrice]) })[0];
}
function getDataLowestPrice(dataCoin) {
  return dataCoin.sort(function (a, b) { return parseFloat(a[indexLowestPrice]) - parseFloat(b[indexLowestPrice]) })[0];
}
function checkSideway(dataCoin) { 
  const highestData = getDataHighestPrice(dataCoin);
  const lowestData = getDataLowestPrice(dataCoin);
  console.log("highestData", highestData);
  console.log("lowestData", lowestData);

  const hightOfLowestCandle = Math.abs(parseFloat(lowestData[indexLastestPriceOrClose]) - parseFloat(lowestData[indexOldPrice]))
  const hightOfHighestCandle = Math.abs(parseFloat(highestData[indexLastestPriceOrClose]) - parseFloat(lowestData[indexLastestPriceOrClose]))
  // let flag = dataCoin.some(item => hightOfLowestCandle > 2 * Math.abs(parseFloat(item[indexLastestPriceOrClose]) - parseFloat(item[indexOldPrice])))

  console.log("hightOflowestCandle", hightOfLowestCandle);
  console.log("hightOfHighestCandle", hightOfHighestCandle);

  const maxHeightAllow = hightOfLowestCandle * setting.sidewayPrice;

  return hightOfHighestCandle < maxHeightAllow;


  // let maxPriceAllow = averagePrice * setting.sidewayPrice;
  // return dataCoin.every(item => parseFloat(item[indexLastestPriceOrClose]) < maxPriceAllow)
}


