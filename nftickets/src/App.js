import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import NFTTicketABI from './abis/nfticketsabi.json';

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          const accounts = await web3Instance.eth.getAccounts();
          const contractAddress = '0xB04e32AF849447e245F79dF83E828B302C33Ae6C'; // Replace with your deployed contract address
          const contractInstance = new web3Instance.eth.Contract(NFTTicketABI, contractAddress);
          
          setWeb3(web3Instance);
          setContract(contractInstance);
          setAccount(accounts[0]);
          
          // Load events
          const eventCount = await contractInstance.methods._tokenIds().call();
          const loadedEvents = [];
          for (let i = 0; i < eventCount; i++) {
            const event = await contractInstance.methods.events(i).call();
            loadedEvents.push({ id: i, ...event });
          }
          setEvents(loadedEvents);
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.log('Non-Ethereum browser detected. Consider trying MetaMask!');
      }
    };
    init();
  }, []);

  const buyTicket = async (eventId) => {
    const event = events[eventId];
    await contract.methods.buyTicket(eventId).send({
      from: account,
      value: event.price
    });
    alert('Ticket purchased successfully!');
  };

  return (
    <div className="App">
      <h1>NFT Ticket System</h1>
      <p>Connected Account: {account}</p>
      <h2>Available Events</h2>
      {events.map((event) => (
        <div key={event.id}>
          <h3>{event.name}</h3>
          <p>Price: {web3?.utils.fromWei(event.price, 'ether')} ETH</p>
          <p>Available: {event.totalSupply - event.ticketsSold} / {event.totalSupply}</p>
          <button onClick={() => buyTicket(event.id)}>Buy Ticket</button>
        </div>
      ))}
    </div>
  );
}

export default App;
