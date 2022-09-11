import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import type { Signers } from "../types";
import { shouldBehaveLikeThrottleWallet } from "./ThrottleWallet.behavior";
import { deployThrottleWalletFixture } from "./ThrottleWallet.fixture";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.alice = signers[1];
    this.signers.john = signers[1];

    this.loadFixture = loadFixture;
  });

  describe("ThrottleWallet", function () {
    beforeEach(async function () {
      const { throttleWallet, mockToken } = await this.loadFixture(deployThrottleWalletFixture);
      this.mockToken = mockToken;
      this.throttleWallet = throttleWallet;
    });

    shouldBehaveLikeThrottleWallet();
  });
});
