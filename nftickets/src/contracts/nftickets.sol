// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTTicket is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Event {
        string name;
        uint256 price;
        uint256 totalSupply;
        uint256 ticketsSold;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => uint256) public ticketToEvent;

    constructor(address initialOwner) ERC721("NFT Ticket", "NFTIX") Ownable(initialOwner) {}

    function createEvent(string memory name, uint256 price, uint256 totalSupply) public onlyOwner {
        uint256 eventId = _tokenIds.current();
        events[eventId] = Event(name, price, totalSupply, 0);
        _tokenIds.increment();
    }

    function buyTicket(uint256 eventId) public payable {
        Event storage event_ = events[eventId];
        require(event_.ticketsSold < event_.totalSupply, "Event sold out");
        require(msg.value >= event_.price, "Insufficient payment");

        uint256 ticketId = _tokenIds.current();
        _safeMint(msg.sender, ticketId);
        ticketToEvent[ticketId] = eventId;
        event_.ticketsSold++;
        _tokenIds.increment();

        if (msg.value > event_.price) {
            payable(msg.sender).transfer(msg.value - event_.price);
        }
    }

    function getEvent(uint256 ticketId) public view returns (Event memory) {
        uint256 eventId = ticketToEvent[ticketId];
        return events[eventId];
    }
}