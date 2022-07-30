const vols = [];
const allSymbols = [];
const indexLastestPriceOrClose = 4;
const indexVol = 5;
const indexOldPrice = 1 // price open time

function main() {
  fetch('https://fapi.binance.com/fapi/v1/ticker/price')
    .then((response) => response.json())
    .then((data) => {
      data.filter(item => {
        if (!allSymbols.includes(item.symbol) && item.symbol.includes("USDT"))
          allSymbols.push(item.symbol)
        })

      const combineData15m = [];
      Promise.all(allSymbols.map(async symbol => {
        const resp = await getDataCoin(symbol, localStorage.getItem("futureTime") || "15m")
        return resp.json();
      })).then(allResult => {
        allResult.forEach((dataDetailCoin, index) => {
          let currentCandleStick = dataDetailCoin.reverse()[0];
          const dataHighestPrice = getDataHighestPrice(dataDetailCoin);
          combineData15m.push({
            coinName: allSymbols[index],
            oldPrice: parseFloat(currentCandleStick[indexOldPrice]),
            lastetPrice: parseFloat(currentCandleStick[indexLastestPriceOrClose]),
            percentChange: `${calculateChangePercentPrice(parseFloat(currentCandleStick[indexLastestPriceOrClose]), parseFloat(currentCandleStick[indexOldPrice]))}%`,
            isVolatilityVol: checkVolatilityVol(dataDetailCoin),
            timeVolatilityVol: checkVolatilityVol(dataDetailCoin) ? moment(dataHighestPrice[0]).format("HH:mm:ss") : "",
            timeVolatilityVolFromNow: checkVolatilityVol(dataDetailCoin) ? moment(dataHighestPrice[0]).fromNow() : ""
          })
        })

        $(".render-item").empty();
        combineData15m.forEach(item => {
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
  </tr>
  `
}


async function getDataCoin(symbol, interval) {
  return fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=15`)
}

function checkVolatilityVol(dataCoin) {
  let data = dataCoin.reverse();
  const highestVol = data.map(item => parseFloat(item[indexVol])).sort(function (a, b) { return b - a })[0];
  let lowestVol = data.map(item => parseFloat(item[indexVol])).sort(function (a, b) { return a - b })[0];
  const currentVol = parseFloat(data[0][indexVol]);
  let isVolatility = false;

  if (currentVol < highestVol) {
    lowestVol = data.map(item => parseFloat(item[5])).sort(function (a, b) { return a - b })[1];
  }
  if (highestVol > lowestVol * 10) isVolatility = true

  return isVolatility
}

function getDataHighestPrice(dataCoin) {
  return dataCoin.sort(function (a, b) { return parseFloat(b[indexVol]) - parseFloat(a[indexVol]) })[0];
}
