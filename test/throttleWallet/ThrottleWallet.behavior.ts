import { expect } from "chai";

export function shouldBehaveLikeThrottleWallet(): void {
  it("should return the new greeting once it's changed", async function () {
    expect(await this.throttleWallet.connect(this.signers.admin).greet()).to.equal("Hello, world!");

    await this.throttleWallet.setGreeting("Bonjour, le monde!");
    expect(await this.throttleWallet.connect(this.signers.admin).greet()).to.equal("Bonjour, le monde!");
  });
}
