import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { MockToken } from "../../src/types/contracts/MockToken";
import type { ThrottleWallet } from "../../src/types/contracts/ThrottleWallet";
import type { MockToken__factory } from "../../src/types/factories/contracts/MockToken__factory";
import type { ThrottleWallet__factory } from "../../src/types/factories/contracts/ThrottleWallet__factory";

export async function deployThrottleWalletFixture(): Promise<{ throttleWallet: ThrottleWallet; mockToken: MockToken }> {
  const signers: SignerWithAddress[] = await ethers.getSigners();
  const admin: SignerWithAddress = signers[0];
  // deploy mock token
  const mockTokenFactory: MockToken__factory = <MockToken__factory>await ethers.getContractFactory("MockToken");
  const mockToken: MockToken = <MockToken>await mockTokenFactory.connect(admin).deploy();
  await mockToken.deployed();
  // deploy throttle walle
  const throttleWalletFactory: ThrottleWallet__factory = <ThrottleWallet__factory>(
    await ethers.getContractFactory("ThrottleWallet")
  );
  const throttleWallet: ThrottleWallet = <ThrottleWallet>(
    await throttleWalletFactory
      .connect(admin)
      .deploy(mockToken.address, ethers.utils.parseEther("100"), ethers.utils.parseEther("10"))
  );
  await throttleWallet.deployed();

  return { throttleWallet, mockToken };
}
