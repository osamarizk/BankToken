// SPDX-License-Identifier: MIT
pragma solidity  >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BankToken is ERC20 {

    using SafeMath for uint256;

    // define Bank Owner
    address public owner; // Bank Owner

    // define TokenReward varaibales
    uint256 public rToken; // TokenReward Pool
    
    // define different contract Periods
    uint256 public t0Deploy;   // contract deployement moment
    uint256 public tDposit;   // Deposit Period
    uint256 public t2Dposit; // withdral Period after 2* tDposit pass
    uint256 public t3Dposit; // withdral Period after 3* tDposit pass
    uint256 public t4Dposit; // withdral Period after 4* tDposit pass

    // define Balances Variables
    uint256 public totalDeposit; // Toatl users deposits

    //withdrawal Variables
    uint256 public amount23;   // withdraw amount+ rewardT23
    uint256 public amount34;  // withdraw amount+ rewardT34
    uint256 public amount4;  // withdraw amount+rewardT4
    uint256 public reward1Rem; // Reward Remaining
    uint256 public rewardT23; // Reward of period t0+2T to t0+3T
    uint256 public rewardT34;  // Reward of period t0+3T to t0+4T
    uint256 public rewardT4;   // Reward of period after 4T

    //Reward Pool 
    uint256 public r1Token; // TokenReward R1 Pool
    uint256 public r2Token; // TokenReward R2 Pool
    

    //Track User Balances
    mapping(address =>uint256) public Balance;

    //define Events
    event Deposite(address indexed from , uint256 value); // Deposit Event
    event Withdrawal(address indexed to , uint256 value); // Withdraw Event

    constructor( uint256 _tDposit )  payable ERC20("ATRAC", "MTK") {
      _mint(msg.sender, 10000 * 10 ** decimals());
        // initial assignments 
        owner=msg.sender; // assign the contract deployer to be Owner
        require(msg.value >0 ,"Invalid value");
        payable(address(this)).transfer(msg.value);
        rToken=msg.value; // TokenReward Pool Amount
        //setup Reward Pool Calculation
        r1Token = (rToken.mul (20)).div(100); 
        r2Token =(rToken.mul (30)).div(100); 
        //asssign contract Time
        t0Deploy=block.timestamp;
        tDposit= _tDposit ;
        t2Dposit= tDposit.mul(2);
        t3Dposit= tDposit.mul(3);
        t4Dposit= tDposit.mul(4);
    }

    // Only Owner Modifier
    modifier onlyOwner() {
        require(msg.sender == owner , "Invalid Owner");
        _;
    }
    // Deposit Function
    function deposite() public payable returns (bool) {
  
        require(msg.value > 0 && msg.value < balanceOf(owner), "Invalid Deposite Value");
        require(msg.sender != address(0), "Invalid Address");
        //During the first period of T time the users can deposit tokens. After T has passed, no more deposits are allowed.
        require(t0Deploy.add(tDposit) > block.timestamp,"Deposit Period Locked");
        Balance[msg.sender] += msg.value;
        totalDeposit += msg.value;
        emit Deposite(msg.sender,msg.value);
        return true;
    }
    // withdrawal Function
    function withdrawal(uint256 _amount) public payable returns (bool) {

        uint256 t02=t0Deploy.add(t2Dposit); // Period 2
        uint256 t03=t0Deploy.add(t3Dposit); // Period 3
        uint256 t04=t0Deploy.add(t4Dposit); // Period 4

        // Owner can not withdraw tokens of Users
        require(msg.sender != owner ,"Owner can not withdraws");
        // user should withdraws all of his tokens.
        require ( Balance[msg.sender] == _amount , "Insufficient funds");
        //After T2 has passed since contract deployment, the users can withdraw their tokens.
        require(t02<block.timestamp , "Locked Period status");

        //If a user withdraws tokens during the period t0+2T to t0+3T
        if(t02<=block.timestamp && block.timestamp <= t03 ){

            rewardT23= r1Token.mul(Balance[msg.sender]).div(totalDeposit);
            Balance[msg.sender] -= _amount;
            totalDeposit -= _amount;
            amount23=_amount.add(rewardT23) ;
            rToken=rToken.sub(rewardT23);
            reward1Rem=r1Token.sub(rewardT23);
            payable(msg.sender).transfer(amount23);
            emit Withdrawal(msg.sender,amount23);
            
            
        } else if (t03<=block.timestamp && block.timestamp <= t04)
         //If a user withdraws tokens during the period t0+3T to t0+4T,
         {
            rewardT34= r2Token.mul(Balance[msg.sender]).div(totalDeposit);
            Balance[msg.sender] -= _amount;
            totalDeposit -= _amount;
            
            amount34=_amount.add(rewardT34).add(reward1Rem) ;
            rToken=rToken.sub(rewardT34).sub(reward1Rem);
            
            payable(msg.sender).transfer(amount34);
            emit Withdrawal(msg.sender,amount34);
        } else if (t04<block.timestamp) {

            rewardT4= rToken.mul(Balance[msg.sender]).div(totalDeposit);
            Balance[msg.sender] -= _amount;
            totalDeposit -= _amount;
            amount4=_amount.add(rewardT4) ;
            rToken=rToken.sub(rewardT4);
            
            payable(msg.sender).transfer(amount4);
            emit Withdrawal(msg.sender,amount4);
        }

         return true;
    }

    function withdrawRemainRwrd() public payable onlyOwner returns (bool) {
        require(t0Deploy.add(t4Dposit)<block.timestamp ,"Last Period status),");
        require (rToken > 0 ,"Insufficient Toke Reward.");
        payable(msg.sender).transfer(rToken);
        rToken=0;
        return true;

    }

    function getBankBanlance () public view onlyOwner returns(uint256) {
        return address(this).balance;
    } 
}
