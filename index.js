// NFT setup
const nftCa = "0xC054A7F7866ba73889511c48967be776008eb408";
const pathToPngs = 'https://ipfs.apes.cash/ipfs/QmNXG6TSr2pVgH1NxoJwbAMLscJVFcHaxB3T9bp7MFByz6/';

// Marketplace setup
const oasisAddr = "0x3b968177551a2aD9fc3eA06F2F41d88b22a081F7";
var nftsFound = [];
const showMaxNfts = 400;

// constants
const divideForsBCH = 10**18;
const orderTypes = ["Fixed", "Dutch", "English"];
const hammer = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hammer" viewBox="0 0 16 16"><path d="M9.972 2.508a.5.5 0 0 0-.16-.556l-.178-.129a5.009 5.009 0 0 0-2.076-.783C6.215.862 4.504 1.229 2.84 3.133H1.786a.5.5 0 0 0-.354.147L.146 4.567a.5.5 0 0 0 0 .706l2.571 2.579a.5.5 0 0 0 .708 0l1.286-1.29a.5.5 0 0 0 .146-.353V5.57l8.387 8.873A.5.5 0 0 0 14 14.5l1.5-1.5a.5.5 0 0 0 .017-.689l-9.129-8.63c.747-.456 1.772-.839 3.112-.839a.5.5 0 0 0 .472-.334z"/></svg>`




// https://stackoverflow.com/questions/5866169/how-to-get-all-selected-values-of-a-multiple-select-box
// Return an array of the selected option values
// select is an HTML select element
function getSelectValues(select) 
{
    var result = [];
    var options = select && select.options;
    var opt;
  
    for (var i=0, iLen=options.length; i<iLen; i++) 
    {
      opt = options[i];
  
      if (opt.selected) 
      {
        result.push(opt.value || opt.text);
      }
    }

    if (result.length == 1 && (result[0] === "" || result[0] === "Any"))
        result = [];

    return result;
}



function appendNft(nft, showPicture) 
{
  htmlString =
    `<div class="col">
    <div class="card shadow-sm">`

  if (true == showPicture) 
  {
    htmlString += `<img src="` + pathToPngs + nft.id + `.png">`;   
  } else 
  {
    htmlString += `<a target="_blank" href="` + pathToPngs + nft.id + `.png">Picture for ` + nft.id + `</a>`;
  }
  htmlString += 
       `<div class="card-body">
        <p class="card-text"><a target="_blank" href="https://oasis.cash/token/`+nftCa+`/`+ nft.id +`"><b>`+ nft.id +`</b></a></p>
        <p>Auction Status: <span id="nftstatus-`+ nft.id +`">loading</span></p>
        <span class="badge bg-secondary"><b>Background</b>: `+ nft.traits.Background +`</span>
        <span class="badge bg-secondary"><b>Fur</b>: `+ nft.traits.Fur +`</span>
        <span class="badge bg-secondary"><b>Clothes</b>: `+ nft.traits.Clothes +`</span>
        <span class="badge bg-secondary"><b>Eyes</b>: `+ nft.traits.Eyes +`</span>
        <span class="badge bg-secondary"><b>Mouth</b>: `+ nft.traits.Mouth +`</span>
        <span class="badge bg-secondary"><b>Earring</b>: `+ nft.traits.Earring +`</span>
        <span class="badge bg-secondary"><b>Hat</b>: `+ nft.traits.Hat +`</span>
        <span class="badge bg-secondary"><b>Profile</b>: `+ nft.traits.Profile +`</span>
        <span class="badge bg-secondary"><b>Special</b>: `+ nft.traits.Special +`</span>
        <span class="badge bg-secondary"><b>trait_count</b>: `+ nft.traits.trait_count +`</span>
        </div>
      </div>
    </div>`
    $("#nfts").append(htmlString)
}


if (window.ethereum) 
{
    handleEthereum();
  } else 
  {
    window.addEventListener('ethereum#initialized', handleEthereum, 
    {
      once: true,
    });
  
    // If the event is not dispatched by the end of the timeout,
    // the user probably doesn't have MetaMask installed.
    setTimeout(handleEthereum, 3000); // 3 seconds
  }
  
  function handleEthereum() 
  {
    const { ethereum } = window;
    if (ethereum && ethereum.isMetaMask) 
    {
      console.log('Ethereum successfully detected!');
      ethereum.request({ method: 'eth_requestAccounts' })
      const web3 = new Web3(Web3.givenProvider);
      oasis = new web3.eth.Contract(oasis_json_interface["abi"], oasisAddr);
      web3.eth.getBlockNumber().then(function(result) 
      {
          currentBlock = parseInt(result);
      });
    } else 
    {
      $("#found").text(`MetaMask not found!`);
      console.log('Please install MetaMask!');
    }
  }

  

function matchesAllFilters(nft, filters) 
{
    for (const [category, traits] of Object.entries(filters)) 
    {
        if(0 == traits.length) 
        {
            // console.log("No filter on " + category + " specified");
            continue;
        } else if(-1 == traits.indexOf(nft["traits"][category])) 
        {
            // console.log("Specified traits for " + category + " not in nft " + nft.id +". Trait is " + nft["traits"][category]);
            return false;
        }
    }
    // console.log(nft.id + " matches all filters");
    return true;
}

async function requestpayment() 
{

    var showOnlyForSale = document.getElementById("onlyForSale").checked;

    $("#found").text = `Status: Processing payment... and preparing results -- this may take a while if you have many matches...`;
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


        $("#nfts").empty();
        nftsFound = [];
        var forsale = 0;

        nfts.forEach
        (function(nft) 
        {
            if(matchesAllFilters(nft, filters)) 
            {
                nftsFound.push(nft);
                if (!showOnlyForSale) {
                  if (showMaxNfts >= nftsFound.length) appendNft(nft, true); else appendNft(nft, false);
                }  
                
                if (showMaxNfts >= nftsFound.length) 
                {
                  // only check oasis for the first matches
                  oasis.methods
                  .tokenOrderLength(nftCa, nft.id).call().then(function(result, error) 
                  {
                      if (error) console.error(error);
                      var orderIndex = parseInt(result)-1;
                      if (orderIndex >= 0) {
                          oasis.methods.orderIdByToken(nftCa, nft.id, orderIndex).call().then(function(result, error) {
                              if (error) console.error(error);
                              var orderId = result;
                              oasis.methods.orderInfo(orderId).call().then(function(result, error) {
                                  if (error) console.error(error);
                                  // console.log(nft);
                                  // console.log(result);
                                  var endBlock = parseInt(result.endBlock);
                                  if(!result.isSold && !result.isCancelled && currentBlock < endBlock) {
                                      var orderType = parseInt(result.orderType);
                                      var startPrice = parseInt(result.startPrice);
                                      var lastBidPrice = parseInt(result.lastBidPrice);
                                      var price = lastBidPrice > 0 ? lastBidPrice : startPrice;
                                      price /= divideForsBCH;
                                      if (showOnlyForSale) appendNft(nft, true);
                                      var auctionText = orderType == 1 ? hammer +" "+ orderTypes[orderType] : hammer +" "+ orderTypes[orderType]+'@'+ price;
                                      $("#nftstatus-"+ nft.id).html(auctionText);
                                      forsale += 1;
                                      $("#forsale").text(`(`+ forsale +` for sale)`);
                                  } else {
                                      if (!showOnlyForSale) $("#nftstatus-"+ nft.id).text("Not for Sale.");
                                  }
                              });
                          })
                      } else {
                          if (!showOnlyForSale) $("#nftstatus-"+ nft.id).text("Not for Sale.");
                      }
                  });  // oasis stuff
                } // don't check oasis if we have too many matches
            }
        })

        $("#found").text(`Status: Found `+ nftsFound.length);
    })
    .catch(function(error) {
        document.getElementById("found").innerHTML = `Status: Payment error`;
        console.error;
    });
}