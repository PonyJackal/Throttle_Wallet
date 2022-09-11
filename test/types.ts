import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { MockToken } from "../src/types/contracts/MockToken";
import type { ThrottleWallet } from "../src/types/contracts/ThrottleWallet";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    mockToken: MockToken;
    throttleWallet: ThrottleWallet;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
}
