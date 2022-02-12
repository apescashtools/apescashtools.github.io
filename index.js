// NFT setup
const nftCa = "0xC054A7F7866ba73889511c48967be776008eb408";
const pathToPngs = 'https://ipfs.apes.cash/ipfs/QmNXG6TSr2pVgH1NxoJwbAMLscJVFcHaxB3T9bp7MFByz6/';

// Marketplace setup
const oasisAddr = "0x3b968177551a2aD9fc3eA06F2F41d88b22a081F7";
var nftsFound = [];
var sellPrices = [];
const showMaxNfts = 50;
var showOnlyForSale = false;

// constants
const divideForsBCH = 10 ** 18;
const orderTypes = ["Fixed", "Dutch", "English"];
const hammer = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hammer" viewBox="0 0 16 16"><path d="M9.972 2.508a.5.5 0 0 0-.16-.556l-.178-.129a5.009 5.009 0 0 0-2.076-.783C6.215.862 4.504 1.229 2.84 3.133H1.786a.5.5 0 0 0-.354.147L.146 4.567a.5.5 0 0 0 0 .706l2.571 2.579a.5.5 0 0 0 .708 0l1.286-1.29a.5.5 0 0 0 .146-.353V5.57l8.387 8.873A.5.5 0 0 0 14 14.5l1.5-1.5a.5.5 0 0 0 .017-.689l-9.129-8.63c.747-.456 1.772-.839 3.112-.839a.5.5 0 0 0 .472-.334z"/></svg>`



function buttonShowTxHist(btnText, nftId) {
  return `<button type="button" class="btn btn-outline-primary btn-sm" onclick="showTxHistory(` + nftId + `, false)">` + btnText + `</button>`
}


function buttonLoadPicture(nftId) {
  return `<button type="button" class="btn btn-outline-primary btn-sm" onclick="loadPicture(` + nftId + `)">Load picture</button>`
}


// https://stackoverflow.com/questions/5866169/how-to-get-all-selected-values-of-a-multiple-select-box
// Return an array of the selected option values
// select is an HTML select element
function getSelectValues(select) {
  var result = [];
  var options = select && select.options;
  var opt;

  for (var i = 0, iLen = options.length; i < iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      result.push(opt.value || opt.text);
    }
  }

  if (result.length == 1 && (result[0] === "" || result[0] === "Any"))
    result = [];

  return result;
}



function appendNft(nft, showPicture, auctionStatus) {
  if (undefined == auctionStatus) auctionStatus = "Auction status loading";
  htmlString =
    `<div class="col">
    <div class="card shadow-sm">`

  if (true == showPicture) {
    htmlString += `<img src="` + pathToPngs + nft.id + `.png">`;
  } else {
    htmlString += `<span id="nftPic-` + nft.id + `">` + buttonLoadPicture(nft.id) + `</span>`;
  }
  htmlString +=
    `<div class="card-body">
        <p class="card-text"><a target="_blank" href="https://oasis.cash/token/`+ nftCa + `/` + nft.id + `"><b>` + nft.id + `</b></a></p>
        <p><span id="nftstatus-`+ nft.id + `">` + buttonShowTxHist(auctionStatus, nft.id) + `</span></p>
        <span><b>Ranks</b>: `+ nft.rank400 + `RF ` + nft.rankRS + `RS ` + nft.rankG + `G ` + nft.rankSR + `S ` + nft.rankAvg + `A</span><br>
        <span><b>Background</b>: `+ nft.traits.Background + ` (` + categories.Background[nft.traits.Background] + `%)</span><br>
        <span><b>Fur</b>: `+ nft.traits.Fur + ` (` + categories.Fur[nft.traits.Fur] + `%)</span><br>
        <span><b>Clothes</b>: `+ nft.traits.Clothes + ` (` + categories.Clothes[nft.traits.Clothes] + `%)</span><br>
        <span><b>Eyes</b>: `+ nft.traits.Eyes + ` (` + categories.Eyes[nft.traits.Eyes] + `%)</span><br>
        <span><b>Mouth</b>: `+ nft.traits.Mouth + ` (` + categories.Mouth[nft.traits.Mouth] + `%)</span><br>
        <span><b>Earring</b>: `+ nft.traits.Earring + ` (` + categories.Earring[nft.traits.Earring] + `%)</span><br>
        <span><b>Hat</b>: `+ nft.traits.Hat + ` (` + categories.Hat[nft.traits.Hat] + `%)</span><br>
        <span><b>Profile</b>: `+ nft.traits.Profile + ` (` + categories.Profile[nft.traits.Profile] + `%)</span><br>
        <span><b>Special</b>: `+ nft.traits.Special + ` (` + categories.Special[nft.traits.Special] + `%)</span><br>
        <span><b>trait_count</b>: `+ nft.traits.trait_count + ` (` + categories.trait_count[nft.traits.trait_count] + `%)</span>
        </div>
      </div>
    </div>`
  $("#nfts").append(htmlString)
}


if (window.ethereum) {
  handleEthereum();
} else {
  window.addEventListener('ethereum#initialized', handleEthereum,
    {
      once: true,
    });

  // If the event is not dispatched by the end of the timeout,
  // the user probably doesn't have MetaMask installed.
  setTimeout(handleEthereum, 3000); // 3 seconds
}

function handleEthereum() {
  const { ethereum } = window;
  if (ethereum && ethereum.isMetaMask) {
    console.log('Ethereum successfully detected!');
    ethereum.request({ method: 'eth_requestAccounts' })
    const web3 = new Web3(Web3.givenProvider);
    oasis = new web3.eth.Contract(oasis_json_interface["abi"], oasisAddr);
    web3.eth.getBlockNumber().then(function (result) {
      currentBlock = parseInt(result);
    });
  } else {
    $("#found").text(`MetaMask not found!`);
    console.log('Please install MetaMask!');
  }
}



function matchesAllFilters(nft, filters) {
  for (const [category, traits] of Object.entries(filters)) {
    if (0 == traits.length) {
      // console.log("No filter on " + category + " specified");
      continue;
    } else if (-1 == traits.indexOf(nft["traits"][category])) {
      // console.log("Specified traits for " + category + " not in nft " + nft.id +". Trait is " + nft["traits"][category]);
      return false;
    }
  }
  // console.log(nft.id + " matches all filters");
  return true;
}



async function loadPicture(nftId) {
  $("#nftPic-" + nftId).html(`<img src="` + pathToPngs + nftId + `.png">`);
}




async function showTxHistory(nftId, showOnlySold) {
  // modifies global array sellPrices
  // get number of previous transactions
  oasis.methods
    .tokenOrderLength(nftCa, nftId).call().then
    (function (result, error) {
      if (error) console.error(error);
      const orderHistoryLength = parseInt(result);
      if (orderHistoryLength < 1) {
        if (!showOnlySold) $("#nftstatus-" + nftId).text("Was never offered", nftId);
        return true;
      }

      var nftTxHistory = "";

      for (let orderNr = 1; orderNr <= orderHistoryLength; orderNr++) {
        oasis.methods.orderIdByToken(nftCa, nftId, orderNr - 1).call().then
          (function (result, error) {
            if (error) console.error(error);
            var orderId = result;
            oasis.methods.orderInfo(orderId).call().then
              (function (result, error) {
                if (error) console.error(error);
                // console.log(nft);
                // console.log(result);
                var endBlock = parseInt(result.endBlock);
                var orderType = parseInt(result.orderType);
                var startPrice = parseInt(result.startPrice);
                var lastBidPrice = parseInt(result.lastBidPrice);
                var price = lastBidPrice > 0 ? lastBidPrice : startPrice;
                price /= divideForsBCH;
                if (result.isSold) {
                  nftTxHistory += orderNr + ". " + orderTypes[orderType] + " sold for " + price + "<br>";
                  $("#nftstatus-" + nftId).html(nftTxHistory);
                  sellPrices.push(price);
                  return true; // continue
                }
                if (result.isCancelled) {
                  if (!showOnlySold) {
                    nftTxHistory += orderNr + ". " + orderTypes[orderType] + " for " + price + " was cancelled<br>";
                    $("#nftstatus-" + nftId).html(nftTxHistory);
                  }
                  return true; // continue
                }
                if (currentBlock > endBlock) {
                  if (!showOnlySold) {
                    nftTxHistory += orderNr + ". " + orderTypes[orderType] + " for " + price + " expired<br>";
                    $("#nftstatus-" + nftId).html(nftTxHistory);
                  }
                  return true; // continue
                }
                // only active auctions remain
                if (!showOnlySold) {
                  nftTxHistory += orderNr + ". Available " + orderTypes[orderType] + '@' + price + " BCH<br>";
                  $("#nftstatus-" + nftId).html(nftTxHistory);
                }
              });
          });
      }
    });
}



async function requestpayment2() {
  sellPrices = [];
  for (const nft of nftsFound) {
    showTxHistory(nft.id, true);
  }
  // nftsFound.forEach
  // (function (nft) {
  //     showTxHistory(nft.id, true);
  // });

  // I have to wait for the result!!!!
  console.log(sellPrices);
}


function updateText(textId, textInput) {
  console.log(textId + " " + textInput);
  $("#" + textId).val(textInput);
  showFilterSettings();
}


function showFilterSettings() {
  var filters = {}
  filters.Background = getSelectValues(document.getElementById("Background"));
  filters.Fur = getSelectValues(document.getElementById("Fur"));
  filters.Clothes = getSelectValues(document.getElementById("Clothes"));
  filters.Eyes = getSelectValues(document.getElementById("Eyes"));
  filters.Mouth = getSelectValues(document.getElementById("Mouth"));
  filters.Earring = getSelectValues(document.getElementById("Earring"));
  filters.Hat = getSelectValues(document.getElementById("Hat"));
  filters.Profile = getSelectValues(document.getElementById("Profile"));
  filters.Special = getSelectValues(document.getElementById("Special"));
  filters.trait_count = getSelectValues(document.getElementById("trait_count"));
  rankMin = $("#rankMin").val();
  rankMax = $("#rankMax").val();
  priceMax = $("#priceMax").val();


  // Show filter settings
  filterSettings = ""
  if ("" != filters.Background) filterSettings += "<b>Background</b>: " + filters.Background + " ";
  if ("" != filters.Fur) filterSettings += "<b>Fur</b>: " + filters.Fur + " ";
  if ("" != filters.Clothes) filterSettings += "<b>Clothes</b>: " + filters.Clothes + " ";
  if ("" != filters.Eyes) filterSettings += "<b>Eyes</b>: " + filters.Eyes + " ";
  if ("" != filters.Mouth) filterSettings += "<b>Mouth</b>: " + filters.Mouth + " ";
  if ("" != filters.Earring) filterSettings += "<b>Earring</b>: " + filters.Earring + " ";
  if ("" != filters.Hat) filterSettings += "<b>Hat</b>: " + filters.Hat + " ";
  if ("" != filters.Profile) filterSettings += "<b>Profile</b>: " + filters.Profile + " ";
  if ("" != filters.Special) filterSettings += "<b>Special</b>: " + filters.Special + " ";
  if ("" != filters.trait_count) filterSettings += "<b>trait_count</b>: " + filters.trait_count + " ";
  if ("" != rankMin) filterSettings += "<b>rankMin</b>: " + rankMin + " ";
  if ("" != rankMax) filterSettings += "<b>rankMax</b>: " + rankMax + " ";
  if ("" != priceMax) filterSettings += "<b>priceMax</b>: " + priceMax;

  if ("" == filterSettings) filterSettings = "No filters set";
  $("#filters").html(filterSettings);
}


async function requestpayment() {

  showOnlyForSale = document.getElementById("onlyForSale").checked;

  $("#found").text = `Processing payment... and preparing results -- this may take a while if you have many matches...`;
  $("#forsale").empty();
  $("#nfts").empty();

  const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
          nonce: '0x00',
          to: '0x88Cbd6227F3B33EDCa69aee5cA7527Fa4B12Ef49',
          from: ethereum.selectedAddress,
          value: '0x0000b60000000000',

      }]
  })    
  .then(function(txHash) {
      console.log(txHash);
  var filters = {}
  filters.Background = getSelectValues(document.getElementById("Background"));
  filters.Fur = getSelectValues(document.getElementById("Fur"));
  filters.Clothes = getSelectValues(document.getElementById("Clothes"));
  filters.Eyes = getSelectValues(document.getElementById("Eyes"));
  filters.Mouth = getSelectValues(document.getElementById("Mouth"));
  filters.Earring = getSelectValues(document.getElementById("Earring"));
  filters.Hat = getSelectValues(document.getElementById("Hat"));
  filters.Profile = getSelectValues(document.getElementById("Profile"));
  filters.Special = getSelectValues(document.getElementById("Special"));
  filters.trait_count = getSelectValues(document.getElementById("trait_count"));

  rankMin = parseInt($("#rankMin").val());
  rankMax = parseInt($("#rankMax").val());
  priceMax = parseFloat($("#priceMax").val());

  if (isNaN(rankMin)) rankMin = 0;
  if (isNaN(rankMax)) rankMax = 99999999999;
  if (isNaN(priceMax)) priceMax = 21000000;

  // console.log(rankMin + " " + rankMax + " " + priceMax);




  $("#nfts").empty();
  nftsFound = [];
  cheapestFixed = 21000000; // in BCH
  cheapestEng = 21000000; // in BCH
  mostExpensive = 0; // in BCH
  var nftsForSale = 0; // counter

  // not implemented yet
  // $("#txHistoryBtn").prop('disabled', false);

  for (const nft of nfts) {
    if (false == matchesAllFilters(nft, filters)) continue;
    // console.log(nft.id);
    if ((rankMax < nft.rank400) && (rankMax < nft.rankRS) && (rankMax < nft.rankG) && (rankMax < nft.rankSR) && (rankMax < nft.rankAvg)) {
      // console.log(nft.id + " skipped, rankMax=" + rankMax + " min=" + Math.min(nft.rank400, nft.rankRS, nft.rankG, nft.rankSR, nft.rankAvg));
      // console.log(nft.rank400 + " " + nft.rankRS + " " + nft.rankG + " " + nft.rankSR + " " + nft.rankAvg);
      continue;
    }
    if ((rankMin > nft.rank400) && (rankMin > nft.rankRS) && (rankMax > nft.rankG) && (rankMin > nft.rankSR) && (rankMin > nft.rankAvg)) {
      // console.log(nft.id + " skipped, rankMin=" + rankMin + " max=" + Math.max(nft.rank400, nft.rankRS, nft.rankG, nft.rankSR, nft.rankAvg));
      // console.log(nft.rank400 + " " + nft.rankRS + " " + nft.rankG + " " + nft.rankSR + " " + nft.rankAvg);
      continue;
    }
    nftsFound.push(nft);
    // console.log(nft.rank400 + " " + nft.rankRS + " " + nft.rankG + " " + nft.rankSR + " " + nft.rankAvg);


    if (!showOnlyForSale) {
      if (showMaxNfts >= nftsFound.length) appendNft(nft, true); else appendNft(nft, false);
    }

    // if (showOnlyForSale || (showMaxNfts >= nftsFound.length)) {
    //   // only check oasis for the first matches
    oasis.methods
      .tokenOrderLength(nftCa, nft.id).call().then
      (function (result, error) {
        if (error) console.error(error);
        var orderIndex = parseInt(result) - 1;
        if (orderIndex < 0) {
          if (!showOnlyForSale) $("#nftstatus-" + nft.id).html(buttonShowTxHist("Was never offered", nft.id));
          return true;
        }

        var auctionText = "";
        var price = 0;
        var orderType = 0;
        oasis.methods.orderIdByToken(nftCa, nft.id, orderIndex).call().then
          (function (result, error) {
            if (error) console.error(error);
            var orderId = result;
            oasis.methods.orderInfo(orderId).call().then
              (function (result, error) {
                if (error) console.error(error);
                // console.log(nft);
                // console.log(result);
                var endBlock = parseInt(result.endBlock);
                orderType = parseInt(result.orderType);
                var startPrice = parseInt(result.startPrice);
                var lastBidPrice = parseInt(result.lastBidPrice);
                price = lastBidPrice > 0 ? lastBidPrice : startPrice;
                price /= divideForsBCH;
                if (result.isSold) {
                  if (!showOnlyForSale) auctionText = orderTypes[orderType] + " sold for " + price;
                  $("#nftstatus-" + nft.id).html(buttonShowTxHist(auctionText, nft.id));
                  return true;
                }
                if (result.isCancelled) {
                  if (!showOnlyForSale) auctionText = orderTypes[orderType] + " for " + price + " was cancelled";
                  $("#nftstatus-" + nft.id).html(buttonShowTxHist(auctionText, nft.id));
                  return true;
                }
                if (currentBlock > endBlock) {
                  if (!showOnlyForSale) auctionText = orderTypes[orderType] + " for " + price + " expired";
                  $("#nftstatus-" + nft.id).html(buttonShowTxHist(auctionText, nft.id));
                  return true;
                }
                // only active auctions remain
                auctionText = hammer + " " + orderTypes[orderType] + '@' + price + " BCH";
                endTime = (endBlock - currentBlock) / 600; // in units of hours
                if (1 > endTime) auctionText += " ends in " + (endTime * 60).toFixed(0) + " minutes";
                else if (endTime > 48) auctionText += " ends in " + (endTime / 24).toFixed(0) + " days";
                else auctionText += " ends in " + Math.floor(endTime) + "h " + ((endTime - Math.floor(endTime)) * 60).toFixed(0) + "min";

                if ((showOnlyForSale) && (priceMax >= price)) appendNft(nft, true, auctionText);
                else $("#nftstatus-" + nft.id).html(buttonShowTxHist(auctionText, nft.id));
                nftsForSale += 1;


                if ((price < cheapestEng) && (2 == orderType)) cheapestEng = price;
                if ((price < cheapestFixed) && (2 > orderType)) cheapestFixed = price;
                if (price > mostExpensive) mostExpensive = price;

                if (cheapestEng < cheapestFixed) {
                  if (cheapestEng < 21000000) $("#forsale").text(`(` + nftsForSale + ` for sale between ` + cheapestFixed + ` and ` + mostExpensive + ` BCH -- English auction available from ` + cheapestEng + `)`);
                  else $("#forsale").text(`(` + nftsForSale + ` for sale as English auction for ` + cheapestEng + ` BCH)`);
                }
                else $("#forsale").text(`(` + nftsForSale + ` for sale between ` + cheapestFixed + ` and ` + mostExpensive + ` BCH)`);
              });
          });
      });
    // } // don't check oasis if we have too many matches
  }

$("#found").text(`Search finished. Found ` + nftsFound.length);
  })
  .catch(function(error) {
      document.getElementById("found").innerHTML = `Payment error`;
      console.error;
  });
}
