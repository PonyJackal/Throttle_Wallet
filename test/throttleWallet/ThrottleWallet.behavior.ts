import { expect } from "chai";
import { ethers } from "hardhat";

export function shouldBehaveLikeThrottleWallet(): void {
  describe("deposit", async function () {
    it("should deposit tokens", async function () {
      const { admin, alice } = this.signers;
      const { throttleWallet, mockToken } = this;
      const amount = ethers.utils.parseEther("500");
      // allow tokens to the contract
      await mockToken.connect(admin).approve(throttleWallet.address, amount);
      // deposit tokens to alice
      await throttleWallet.connect(admin).deposit(alice.address, amount);
      // check balance
      expect(await throttleWallet.balanceOf(alice.address)).to.equal(amount);
    });

    it("should emit Deposit event", async function () {
      const { admin, alice } = this.signers;
      const { throttleWallet, mockToken } = this;
      const amount = ethers.utils.parseEther("500");
      // allow tokens to the contract
      await mockToken.connect(admin).approve(throttleWallet.address, amount);
      // deposit tokens to alice
      await expect(throttleWallet.connect(admin).deposit(alice.address, amount))
        .to.emit(throttleWallet, "Deposited")
        .withArgs(admin.address, alice.address, amount);
    });
  });

  describe("spend", async function () {
    beforeEach(async function () {
      const { admin, alice } = this.signers;
      const { throttleWallet, mockToken } = this;
      const amount = ethers.utils.parseEther("160");
      // allow tokens to the contract
      await mockToken.connect(admin).approve(throttleWallet.address, amount);
      // deposit tokens to alice
      await throttleWallet.connect(admin).deposit(alice.address, amount);
    });

    it("should spend tokens", async function () {
      const { admin, alice, john } = this.signers;
      const { throttleWallet, mockToken } = this;
      const amount = ethers.utils.parseEther("50");
      // spend tokens to john, check token balance change
      await expect(() => throttleWallet.connect(alice).spend(john.address, amount)).to.changeTokenBalance(
        mockToken,
        john,
        amount,
      );
    });

    it("should revert it if exceeds max limit", async function () {
      const { admin, alice, john } = this.signers;
      const { throttleWallet, mockToken } = this;
      const amount = ethers.utils.parseEther("150");
      // deposit tokens to john
      const tx = throttleWallet.connect(alice).spend(john.address, amount);
      await expect(tx).to.be.revertedWith("ThrottleWallet: amount is invalid");
    });

    it("should revert it if balance is sufficient", async function () {
      const { admin, alice, john } = this.signers;
      const { throttleWallet, mockToken } = this;
      // sepnd 90 tokens to john
      await throttleWallet.connect(alice).spend(john.address, ethers.utils.parseEther("90"));
      // spend 90 tokens to john
      const tx2 = throttleWallet.connect(alice).spend(john.address, ethers.utils.parseEther("90"));
      await expect(tx2).to.be.revertedWith("ThrottleWallet: insufficient balance");
    });

    it("should revert it if limit is exceeded 1", async function () {
      const { admin, alice, john } = this.signers;
      const { throttleWallet, mockToken } = this;
      // sepnd 90 tokens to john
      await throttleWallet.connect(alice).spend(john.address, ethers.utils.parseEther("90"));
      // spend 60 tokens to john
      const tx = throttleWallet.connect(alice).spend(john.address, ethers.utils.parseEther("60"));
      await expect(tx).to.be.revertedWith("ThrottleWallet: limit exceeded");
    });

    it("should revert it if limit is exceeded", async function () {
      const { admin, alice, john } = this.signers;
      const { throttleWallet, mockToken } = this;
      // sepnd 90 tokens to john
      await throttleWallet.connect(alice).spend(john.address, ethers.utils.parseEther("90"));
      // mint 3 blocks
      await ethers.provider.send("evm_mine", []);
      await ethers.provider.send("evm_mine", []);
      await ethers.provider.send("evm_mine", []);
      // should be able to spend 50 tokens to john
      await throttleWallet.connect(alice).spend(john.address, ethers.utils.parseEther("50"));
      // spend 15 tokens to john
      const tx = throttleWallet.connect(alice).spend(john.address, ethers.utils.parseEther("15"));
      await expect(tx).to.be.revertedWith("ThrottleWallet: limit exceeded");
    });

    it("should emit Spent event", async function () {
      const { admin, alice, john } = this.signers;
      const { throttleWallet } = this;
      const amount = ethers.utils.parseEther("50");
      // spend tokens to john
      await expect(throttleWallet.connect(alice).spend(john.address, amount))
        .to.emit(throttleWallet, "Spent")
        .withArgs(alice.address, john.address, amount);
    });
  });
}
