// SPDX-License-Identifier: GPL-3.0 License
pragma solidity ^0.8.3;
import "./NFT.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;
  Counters.Counter private _itemsDeleted;
  address payable owner;
  uint256 listingPrice = 0.025 ether;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;

  event MarketItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );
  event MarketItemDeleted (
    uint indexed itemId
  );
  event ProductListed( 
    uint indexed itemId
  );
 
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }
  

  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, "Preco tem que ser maior que 0");
    require(msg.value == listingPrice, "Preco tem que ser igual ao valor listado");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();
  
    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false
    );
    
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false
    );
  }
 function sellMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, "Preco tem que ser maior que 0");
   
    _itemIds.increment();
    uint256 itemId = _itemIds.current();

   idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false
    );
    
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketItemCreated(
     itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false
    );
  }

  
  // function approve(address to, uint256 tokenId) public virtual override {
  //       address owner = ERC721.ownerOf(tokenId);
  //       require(to != owner, "ERC721: approval to current owner");

  //       require(
  //           _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
  //           "ERC721: approve caller is not owner nor approved for all"
  //       );

  //       _approve(to, tokenId);
  //   }
  
  
  function createMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    require(msg.value == price, "Envie o valor certo da compra");

    idToMarketItem[itemId].seller.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
    payable(owner).transfer(listingPrice);
  }
  modifier onlyItemOwner(uint256 id) {
        require(
            idToMarketItem[id].owner == msg.sender,
            "Only product owner can do this operation"
        );
        _;
    }
  modifier onlyProductOrMarketPlaceOwner(uint256 id) {
        require(
            idToMarketItem[id].owner == address(this),
            "Only product or market owner can do this operation"
        );
        _;
    }
//  function putItemToResell(address nftContract, uint256 itemId, uint256 newPrice)
//         public
//         payable
//         nonReentrant
//         onlyItemOwner(itemId)
//     {
  
      
    
//       uint256 tokenId = idToMarketItem[itemId].tokenId;
      
//       idToMarketItem[itemId] =  MarketItem(
//         itemId,
//         nftContract,
//         tokenId,
//         payable(msg.sender),
//         payable(address(0)),
//         newPrice,
//         false
//       );
    
//       NFT tokenContract = NFT(nftContract);

//       tokenContract.transferToken(msg.sender, address(this), tokenId);   

//       emit MarketItemCreated(
//         itemId,
//         nftContract,
//         tokenId,
//         msg.sender,
//         address(0),
//         newPrice,
//         false
//       );
//     }
  function putItemToResell(address nftContract, uint256 itemId, uint256 newPrice)
        public
        payable
        nonReentrant
        onlyItemOwner(itemId)
    {
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require(newPrice > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        NFT tokenContract = NFT(nftContract);

        tokenContract.transferToken(msg.sender, address(this), tokenId);
       
        address payable oldOwner = idToMarketItem[itemId].owner;
        idToMarketItem[itemId].owner = payable(address(0));
        idToMarketItem[itemId].seller = oldOwner;
        idToMarketItem[itemId].price = newPrice;
        idToMarketItem[itemId].sold = false;
        _itemsSold.decrement();

        emit ProductListed(itemId);
    }

    function deleteMarketItem(uint256 itemId)
        public
        payable
        onlyProductOrMarketPlaceOwner(itemId)
    {
        delete idToMarketItem[itemId];
        _itemsDeleted.increment();

        emit MarketItemDeleted(itemId);
    
    }
  function transferFrom(address nftContract, uint256 itemId) public payable nonReentrant {
        //solhint-disable-next-line max-line-length
        uint tokenId = idToMarketItem[itemId].tokenId;
        idToMarketItem[itemId].owner = payable(address(this));
        idToMarketItem[itemId].sold = false;
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
      
       
    }

  
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

 function fetchSpecificItem(uint256 providedId) public view returns (uint256 value) {
    uint value = 1;
    return value;
   }
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

 
  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;


      }
    }
    return items;
  }
}
