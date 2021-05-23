// test/xvault.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

// Load compiled artifacts
const XToken = artifacts.require('XToken');
const Minter = artifacts.require('Minter');

// Start test block
contract('XToken', function ([ xOwner, minterOwner, user, user2 ]) {

    beforeEach(async function () {
        this.xtoken = await XToken.new("xbx token", "XBX", 1000000, {from: xOwner});
        this.minter = await Minter.new(this.xtoken.address, {from: minterOwner});
    });

    it('Check initialization', async function () {
        name = await this.xtoken.name();
        symbol = await this.xtoken.symbol();
        cap = await this.xtoken.cap();
        totalsupply = await this.xtoken.totalSupply();
        expect(name).to.equal("xbx token");
        expect(symbol).to.equal("XBX");
        expect(cap.toString()).to.equal("1000000");
        expect(totalsupply.toString()).to.equal("0");
    });

    it('Check roles', async function () {
        addresses = await this.xtoken.getMinters();
        expect(addresses.length).to.equal(1);
        expect(addresses.includes(xOwner)).to.equal(true);

        // grant minter
        result = await this.xtoken.grantMinter(this.minter.address, {from: xOwner});
        addresses = await this.xtoken.getMinters();
        expect(addresses.length).to.equal(2);
        expect(addresses.includes(xOwner)).to.equal(true);
        expect(addresses.includes(this.minter.address)).to.equal(true);

        // minter and user can not grant
        result = await expectRevert(
            this.xtoken.grantMinter(this.minter.address, {from: this.minter.address}),
            "Caller is not a admin"
        );
        result = await expectRevert(
            this.xtoken.grantMinter(this.minter.address, {from: user}),
            "Caller is not a admin"
        );

        // minter and user can not revoke
        result = await expectRevert(
            this.xtoken.revokeMinter(xOwner, {from: this.minter.address}),
            "Caller is not a admin"
        );
        result = await expectRevert(
            this.xtoken.revokeMinter(xOwner, {from: user}),
            "Caller is not a admin"
        );
        result = await expectRevert(
            this.xtoken.revokeMinter(this.minter.address, {from: user}),
            "Caller is not a admin"
        );

        // revoke minter
        result = await this.xtoken.revokeMinter(this.minter.address, {from: xOwner});
        addresses = await this.xtoken.getMinters();
        expect(addresses.length).to.equal(1);
        expect(addresses.includes(xOwner)).to.equal(true);
        expect(addresses.includes(this.minter.address)).to.equal(false);
    });

    it('minter can set new cap and mint', async function () {
        result = await this.xtoken.setCap(2000000, {from: xOwner});
        cap = await this.xtoken.cap();
        expect(cap.toString()).to.equal("2000000");

        // mint 2000000 coins to user
        result = await this.xtoken.mint(user, 2000000, {from: xOwner});
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("2000000");

        // user can not set cap
        result = await expectRevert(
            this.xtoken.setCap(2000000, {from: user}),
            "Caller is not a minter"
        );

        // mint more will hit the cap and revert
        result = await expectRevert(
            this.xtoken.mint(user, 2000000, {from: xOwner}),
            "ERC20 Capped: cap exceeded"
        );
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("2000000");

        // set new cap to 4000000
        result = await this.xtoken.setCap(4000000, {from: xOwner});
        cap = await this.xtoken.cap();
        expect(cap.toString()).to.equal("4000000");

        // mint 1000000 more to user
        result = await this.xtoken.mint(user, 1000000, {from: xOwner});
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("3000000");
        totalsupply = await this.xtoken.totalSupply();
        expect(totalsupply.toString()).to.equal("3000000");

        // set cap to 0 will fail
        result = await expectRevert(
            this.xtoken.setCap(0, {from: xOwner}),
            "ERC20: cap is 0"
        );

        // set cap to less than total supply will fail
        result = await expectRevert(
            this.xtoken.setCap(2999999, {from: xOwner}),
            "ERC20: new cap should be larger than total supply"
        );
    });

    it('minter can mint after role grant', async function () {
        // should revert without mint role granted
        result = await expectRevert(
            this.minter.mint(user, 1000000, {from: minterOwner}),
            "Caller is not a minter"
        );

        // grant minter
        result = await this.xtoken.grantMinter(this.minter.address, {from: xOwner});
        addresses = await this.xtoken.getMinters();
        expect(addresses.length).to.equal(2);
        expect(addresses.includes(xOwner)).to.equal(true);
        expect(addresses.includes(this.minter.address)).to.equal(true);

        // mint 1000000 to user
        result = await this.minter.mint(user, 1000000, {from: minterOwner});

        // check total supply and balance
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("1000000");
        totalsupply = await this.xtoken.totalSupply();
        expect(totalsupply.toString()).to.equal("1000000");

        // revoke
        result = await this.xtoken.revokeMinter(this.minter.address, {from: xOwner});
        addresses = await this.xtoken.getMinters();
        expect(addresses.length).to.equal(1);
        expect(addresses.includes(xOwner)).to.equal(true);
        expect(addresses.includes(this.minter.address)).to.equal(false);

        // should revert without mint role granted
        result = await expectRevert(
            this.minter.mint(user, 1000000, {from: minterOwner}),
            "Caller is not a minter"
        );

        // check total supply and balance
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("1000000");
        totalsupply = await this.xtoken.totalSupply();
        expect(totalsupply.toString()).to.equal("1000000");
    });

    it('check mint and transfer after pause', async function () {
        result = await this.xtoken.mint(user, 100000, {from: xOwner});

        // check total supply and balance
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("100000");
        totalsupply = await this.xtoken.totalSupply();
        expect(totalsupply.toString()).to.equal("100000");

        // transfer between user and user2
        result = await this.xtoken.transfer(user2, 10000, {from: user});
        balance = await this.xtoken.balanceOf(user2);
        expect(balance.toString()).to.equal("10000");
        result = await this.xtoken.transfer(user, 10000, {from: user2});
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("100000");
        balance = await this.xtoken.balanceOf(user2);
        expect(balance.toString()).to.equal("0");

        // non-admin can not pause
        result = await expectRevert(
            this.xtoken.pause({from: user}),
            "Caller is not a admin"
        );

        // admin can pause
        result = await this.xtoken.pause({from: xOwner});

        // mint should revert
        result = await expectRevert(
            this.xtoken.mint(user, 100000, {from: xOwner}),
            "paused"
        );

        // non-admin can not unpause
        result = await expectRevert(
            this.xtoken.unpause({from: user}),
            "Caller is not a admin"
        );

        // admin can unpause
        result = await this.xtoken.unpause({from: xOwner});

        // mint 100000 more coins to user
        result = await this.xtoken.mint(user, 100000, {from: xOwner});

        // check total supply and balance
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("200000");
        totalsupply = await this.xtoken.totalSupply();
        expect(totalsupply.toString()).to.equal("200000");
    });

    it('check erc20 interface', async function () {
        result = await this.xtoken.mint(user, 100000, {from: xOwner});

        // check total supply and balance
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("100000");
        totalsupply = await this.xtoken.totalSupply();
        expect(totalsupply.toString()).to.equal("100000");

        // user2 has no balance, should revert
        result = await expectRevert(
            this.xtoken.transfer(user, 10000, {from: user2}),
            "ERC20: transfer amount exceeds balance"
        );

        // transfer 10000 from user to user2
        result = await this.xtoken.transfer(user2, 10000, {from: user});
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("90000");
        balance = await this.xtoken.balanceOf(user2);
        expect(balance.toString()).to.equal("10000");

        // revert before approve
        result = await expectRevert(
            this.xtoken.transferFrom(user, user2, 10000, {from: user2}),
            "ERC20: transfer amount exceeds allowance"
        );

        // approve 10000 from user to user2
        result = await this.xtoken.approve(user2, 10000, {from: user});
        allow = await this.xtoken.allowance(user, user2);
        expect(allow.toString()).to.equal("10000");
        result = await this.xtoken.transferFrom(user, user2, 10000, {from: user2});

        // check balance
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("80000");
        balance = await this.xtoken.balanceOf(user2);
        expect(balance.toString()).to.equal("20000");
        totalsupply = await this.xtoken.totalSupply();
        expect(totalsupply.toString()).to.equal("100000");

        // pause
        result = await this.xtoken.pause({from: xOwner});

        // transfer fail after pause
        result = await expectRevert(
            this.xtoken.transfer(user2, 10000, {from: user}),
            "ERC20 Pausable: token transfer while paused"
        );

        // approve still works but transferfrom should rever
        result = await this.xtoken.approve(user2, 10000, {from: user});
        allow = await this.xtoken.allowance(user, user2);
        expect(allow.toString()).to.equal("10000");
        result = await expectRevert(
            this.xtoken.transferFrom(user, user2, 10000, {from: user2}),
            "ERC20 Pausable: token transfer while paused"
        );

        // unpause
        result = await this.xtoken.unpause({from: xOwner});

        // transfer should resume
        result = await this.xtoken.transfer(user2, 10000, {from: user});
        result = await this.xtoken.transferFrom(user, user2, 10000, {from: user2});
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("60000");
        balance = await this.xtoken.balanceOf(user2);
        expect(balance.toString()).to.equal("40000");
        allow = await this.xtoken.allowance(user, user2);
        expect(allow.toString()).to.equal("0");
    });

    it('check reject ether transfer', async function () {
        result = await expectRevert(
            this.xtoken.sendTransaction({from: user, value: 1000}),
            "revert"
        );
    });

    it('check mint by contract', async function () {
        // user have 0 balance
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("0");

        // mint will revert for minter contract
        result = await expectRevert(
            this.minter.mint(user, 10000, {from: minterOwner}),
            "Caller is not a minter"
        );

        // user remain 0 balance
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("0");

        // grant minter
        result = await this.xtoken.grantMinter(this.minter.address, {from: xOwner});
        addresses = await this.xtoken.getMinters();
        expect(addresses.length).to.equal(2);
        expect(addresses.includes(xOwner)).to.equal(true);
        expect(addresses.includes(this.minter.address)).to.equal(true);

        // mint by minter again
        result = await this.minter.mint(user, 10000, {from: minterOwner});

        // user now has 10000 balance
        balance = await this.xtoken.balanceOf(user);
        expect(balance.toString()).to.equal("10000");
    });
});
