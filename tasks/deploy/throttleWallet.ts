import { Signer } from "@ethersproject/abstract-signer";
import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { ThrottleWallet } from "../../src/types/contracts/ThrottleWallet";
import { ThrottleWallet__factory } from "../../src/types/factories/contracts/ThrottleWallet__factory";
import { readContractAddress, writeContractAddress } from "./addresses/utils";
import cArguments from "./arguments/throttleWallet";

task("deploy:ThrottleWallet").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const accounts: Signer[] = await ethers.getSigners();

  // deploy ThrottleWallet
  const throttleWalletFactory: ThrottleWallet__factory = <ThrottleWallet__factory>(
    await ethers.getContractFactory("ThrottleWallet", accounts[0])
  );
  const throttleWallet: ThrottleWallet = <ThrottleWallet>(
    await throttleWalletFactory.deploy(cArguments.TOKEN_ADDRESS, cArguments.MAX_LIMIT, cArguments.REFILL_RATE)
  );
  await throttleWallet.deployed();

  writeContractAddress("throttleWallet", throttleWallet.address);
  console.log("throttleWallet deployed to: ", throttleWallet.address);
});

task("verify:ThrottleWallet").setAction(async function (taskArguments: TaskArguments, { run }) {
  const address = readContractAddress("throttleWallet");

  await run("verify:verify", {
    address,
    constructorArguments: [cArguments.TOKEN_ADDRESS, cArguments.MAX_LIMIT, cArguments.REFILL_RATE],
  });
});
