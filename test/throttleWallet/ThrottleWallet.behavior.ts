import { expect } from "chai";
import ethers from "ethers";

export function shouldBehaveLikeThrottleWallet(): void {
  describe("deposit", async function () {
    it("should deposit tokens", async function () {
      const { admin, alice } = this.signers;
      const { throttleWallet } = this;
      const amount = ethers.utils.parseEther("500");
      // deposit tokens to alice
      await throttleWallet.connect(admin).deposit(alice.address, amount);
      // check balance
      expect(await throttleWallet.balanceOf(alice.address)).to.equal(amount);
    });

    it("should emit Deposit event", async function () {
      const { admin, alice } = this.signers;
      const { throttleWallet } = this;
      const amount = ethers.utils.parseEther("500");
      // deposit tokens to alice
      await expect(throttleWallet.connect(admin).deposit(alice.address, amount))
        .to.emit(throttleWallet, "Deposited")
        .withArgs(admin.address, alice.address, amount);
    });
  });
}
