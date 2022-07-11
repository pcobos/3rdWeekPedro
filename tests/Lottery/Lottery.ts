// importing from chai, TDD library for node
import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
// importing the Lottery contract from Typechain, (Typescript bindings for Ethereum smart contracts)
import { Lottery, LotteryToken } from "../../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// For token purchases
import { BigNumber } from "ethers";

const DEFAULT_PURCHASE_RATIO = 100;
const BET_PRICE = 10;
const BET_FEE = 1;

describe("Lottery", function () {
  let lotteryContract: Lottery;
  let lotteryFactory: any;
  let tokenContractFactory: any;
  let accounts: SignerWithAddress[];
  let tokenContract: LotteryToken;

  this.beforeEach(async function () {
    accounts = await ethers.getSigners();

    lotteryFactory = await ethers.getContractFactory("Lottery");
    lotteryContract = await lotteryFactory.deploy(
      "BetToken",
      "BET",
      DEFAULT_PURCHASE_RATIO,
      ethers.utils.parseEther(BET_PRICE.toFixed(18)),
      ethers.utils.parseEther(BET_FEE.toFixed(18))
    );
    await lotteryContract.deployed();

    const tokenContractAddress = await lotteryContract.paymentToken();
    const tokenContractFactory = await ethers.getContractFactory(
      "LotteryToken"
    );
    tokenContract = await tokenContractFactory.attach(tokenContractAddress);
  });

  describe("When the Lottery Contract is deployed", async () => {
    it("defines the ratio as provided in parameters", async () => {
      const purchaseRatio = await lotteryContract.purchaseRatio();
      expect(purchaseRatio).to.eq(DEFAULT_PURCHASE_RATIO);
    });

    it("uses a valid ERC20 as a payment token", async () => {
      const symbol = await tokenContract.symbol();
      const name = await tokenContract.name();
      console.log(symbol, name);
      expect(symbol.length).to.be.greaterThan(0);
      expect(name.length).to.be.greaterThan(0);
    });
    it("has the correct bet price and bet fee as defined in parameters", async () => {
      const contractBetPrice = await lotteryContract.betPrice();
      const contractBetFee = await lotteryContract.betFee();
      expect(contractBetFee.toString()).to.eq(
        ethers.utils.parseEther(BET_FEE.toString()).toString()
      );
      expect(contractBetPrice.toString()).to.eq(
        ethers.utils.parseEther(BET_PRICE.toString()).toString()
      );
    });
  });
  describe("When a user purchases an ERC20", async () => {
    let accountValue: BigNumber;
    let txFee: BigNumber;
    let tokensEarned: BigNumber;
    const ETH_SPENT = 1;

    beforeEach(async () => {
      accountValue = await accounts[0].getBalance();
      const purchaseTokenTx = await lotteryContract.purchaseTokens({
        value: ethers.utils.parseEther(ETH_SPENT.toFixed(0)),
      });
      const purchaseTokenReceipt = await purchaseTokenTx.wait();
      const gasUsed = await purchaseTokenReceipt.gasUsed;
      const gasPrice = await purchaseTokenReceipt.effectiveGasPrice;
      txFee = gasUsed.mul(gasPrice);
      tokensEarned = await tokenContract.balanceOf(accounts[0].address);
    });
    it("charges the correct amount of ETH", async () => {
      const currentAccountValue = await accounts[0].getBalance();
      const ethSpent = accountValue.sub(currentAccountValue.add(txFee));
      console.log(ethSpent);
      expect(ethSpent).to.eq(ethers.utils.parseEther(ETH_SPENT.toFixed(0)));
    });
    it("send the correct amount of tokens", async () => {
      expect(
        ethers.utils
          .parseEther((ETH_SPENT / DEFAULT_PURCHASE_RATIO).toString())
          .toString()
      ).to.eq(tokensEarned.toString());
    });
  });
  describe("When a user returns a ERC20", async () => {
    it("charges the correct amount of ERC20", async () => {
      // TODO
    });
    it("send the correct amount of eth", async () => {
      // TODO
    });
  });
  describe("When the owner opens the bets", async () => {
    it("correctly sets the closing time ", async () => {
      // TODO
    });
    it("is able to be closed", async () => {
      // TODO
    });
    describe("When a user places a bet and bets are open", async () => {
      it("correctly updates the ownerpool", async () => {
        // TODO
      });
      it("correctly updates the prize pool", async () => {
        // TODO
      });
      it("registers the bet in the slot array", async () => {
        // TODO
      });
    });
    describe("When a user places a bet and bets are closed", async () => {
      it("fails if the bets are not open ", async () => {
        // TODO
      });
    });
  });

  describe("When a user purchases an ERC20 from the token contract", async () => {
    it("charges the correct amount of ETH", async () => {
      // TOD
    });

    it("gives the correct amount of tokens", async () => {
      // TODO
    });
  });
});
