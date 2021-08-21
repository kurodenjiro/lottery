import React, { Component } from "react";
import LotteryContract from "./contracts/Lottery.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      contract: null,
      manager: '',
      players: [],
      balance: '',
      value: '',
      message:'',
      winner: '',
      prize: ''
    };

  }

  componentDidMount = async () => {
    const web3 = await getWeb3();
    // Get the contract instance.
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = LotteryContract.networks[networkId];
    const lottery = new web3.eth.Contract(
      LotteryContract.abi,
      deployedNetwork && deployedNetwork.address,
    );

    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({manager: manager, players: players, balance, web3, contract: lottery});

    console.log(this.state.balance);
  }

  // componentDidMount = async () => {
  //   try {
  //     // Get network provider and web3 instance.
  //     const web3 = await getWeb3();

  //     // Use web3 to get the user's accounts.
  //     const accounts = await web3.eth.getAccounts();

  //     // Get the contract instance.
  //     const networkId = await web3.eth.net.getId();
  //     const deployedNetwork = LotteryContract.networks[networkId];
  //     const instance = new web3.eth.Contract(
  //       LotteryContract.abi,
  //       deployedNetwork && deployedNetwork.address,
  //     );

  //     // Set web3, accounts, and contract to the state, and then proceed with an
  //     // example of interacting with the contract's methods.
  //     this.setState({ web3, accounts, contract: instance }, this.runExample);
  //   } catch (error) {
  //     // Catch any errors for any of the above operations.
  //     alert(
  //       `Failed to load web3, accounts, or contract. Check console for details.`,
  //     );
  //     console.error(error);
  //   }
  // };


  onSubmit = async (e) => {
    e.preventDefault();
    try {
      const accounts = await this.state.web3.eth.getAccounts();

      this.setState({message: 'Waiting on transaction success ...'});
  
      await this.state.web3.eth.sendTransaction({
        from:accounts[0],
        to:this.state.lottery.options.address,
        value:this.state.web3.utils.toWei(this.state.value,'ether')
      })
  
      this.setState({message: 'You have beend entered'});

    } catch (err) {
      console.log("web3.eth.handleRevert =", this.state.web3.eth.handleRevert)
      console.error(err);
      console.log("err.message =",err.message);
    }
   
  }

  onChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  }

  onClick = async (e) => {
    e.preventDefault();
    this.setState({message:'Waiting on transaction success ...'});

    const accounts = await this.state.web3.eth.getAccounts();
    const receipt = await this.state.lottery.methods.pickWinner().send({from: accounts[0]});
    const returnValues = receipt.events.PickWinnerEvent.returnValues;

    this.setState({winner: returnValues.winner, prize: returnValues.prize});

    this.setState({message:'Waiting on transaction success ...'});
  }

  render() {
     if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="container">
        <div className="row mt-5">
          <div className="col-sm-6">
            <div className="App">
              <h1>Lottery Contract</h1>
              <p>This contract is managed by:  {this.state.manager}</p> 
              <p>There are currently {this.state.players.length} people entered, compeiting to win {this.state.web3.utils.fromWei(this.state.balance,'ether')} ether</p>
              <hr/>
              <form onSubmit={this.onSubmit} noValidate>
                <h4>Wanna try your luck?</h4>
                <div className="form-group">
                  <label>Amount of ether to enter</label>
                  <input name='value'
                  onChange={this.onChange}
                  value={this.state.value}
                  className="form-control"
                  placeholder="Please enter exact amount(ether): 0.1" />
                </div>
                <button className="btn btn-warning" type='submit'>Enter</button>
              </form>
              <hr/>
              <p>{this.state.message}</p>
              <hr />
              <h4>Ready to pick a winner?</h4>
              <p>Winner: {this.state.winner}</p>
              <p>Prize: {this.state.web3.utils.fromWei(this.state.prize,'ether')} ether</p>
              <button className="btn btn-info" onClick={this.onClick}>Pick winner</button>

            </div>
          </div>
          <div className="col-sm-6">
            <div className="">
            <h2>User stories</h2>
            <ul className="list-group text-success">
              <li className="list-group-item">1. As a player, I want to pacticiate in the lotter with my ETH account</li>
              <li className="list-group-item">2. As a manager, I want to set the fixed amount to pacticiate in the Lottery</li>
              <li className="list-group-item">3. As a manager, I want to be able to pick the winner</li>
              <li className="list-group-item">4. As a manager, I want to take 10% as fee</li>
              <li className="list-group-item">5. As a player, I will take 90% as a prize of the lottery</li>
            </ul>
            </div>
          </div>
        </div>
      </div>
      
    );
  }
}

export default App;
