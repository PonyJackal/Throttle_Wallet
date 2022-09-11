import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { ThrottleWallet } from "../../src/types/contracts/ThrottleWallet";
import type { ThrottleWallet__factory } from "../../src/types/factories/contracts/ThrottleWallet__factory";
import { MAX_LIMIT, REFILL_RATE, TOKEN_ADDRESS } from "../constants";

export async function deployThrottleWalletFixture(): Promise<{ throttleWallet: ThrottleWallet }> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];

  const throttleWalletFactory: ThrottleWallet__factory = <ThrottleWallet__factory>(
    await ethers.getContractFactory("ThrottleWallet")
  );
  const throttleWallet: ThrottleWallet = <ThrottleWallet>(
    await throttleWalletFactory.connect(admin).deploy(TOKEN_ADDRESS, MAX_LIMIT, REFILL_RATE)
  );
  await throttleWallet.deployed();

  return { throttleWallet };
}
