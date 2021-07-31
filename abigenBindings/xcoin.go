// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package main

import (
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// RoleAccessRole is an auto generated low-level Go binding around an user-defined struct.
type RoleAccessRole struct {
	Role     [32]byte
	Describe string
}

// XCoinABI is the input ABI used to generate the binding from.
const XCoinABI = "[{\"inputs\":[{\"internalType\":\"string\",\"name\":\"name\",\"type\":\"string\"},{\"internalType\":\"string\",\"name\":\"symbol\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"cap_\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"_account\",\"type\":\"address\"}],\"name\":\"Blacklisted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"Paused\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"previousAdminRole\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"newAdminRole\",\"type\":\"bytes32\"}],\"name\":\"RoleAdminChanged\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"RoleGranted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"}],\"name\":\"RoleRevoked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"_account\",\"type\":\"address\"}],\"name\":\"UnBlacklisted\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"Unpaused\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"DEFAULT_ADMIN_ROLE\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"member\",\"type\":\"address\"}],\"name\":\"addRoleMember\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"owner\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"blacklist\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"decimals\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"subtractedValue\",\"type\":\"uint256\"}],\"name\":\"decreaseAllowance\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"}],\"name\":\"getRoleAdmin\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"getRoleMember\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"}],\"name\":\"getRoleMemberCount\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"}],\"name\":\"getRoleMembers\",\"outputs\":[{\"internalType\":\"address[]\",\"name\":\"\",\"type\":\"address[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getRoles\",\"outputs\":[{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"string\",\"name\":\"describe\",\"type\":\"string\"}],\"internalType\":\"structRoleAccess.Role[]\",\"name\":\"\",\"type\":\"tuple[]\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"grantRole\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"hasRole\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"addedValue\",\"type\":\"uint256\"}],\"name\":\"increaseAllowance\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"isBlacklisted\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"name\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"paused\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"member\",\"type\":\"address\"}],\"name\":\"removeRoleMember\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"renounceRole\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"role\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"revokeRole\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes4\",\"name\":\"interfaceId\",\"type\":\"bytes4\"}],\"name\":\"supportsInterface\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"symbol\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"}],\"name\":\"unBlacklist\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"cap\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"cap_\",\"type\":\"uint256\"}],\"name\":\"setCap\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"minter\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"allowance\",\"type\":\"uint256\"}],\"name\":\"grantMinter\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"minter\",\"type\":\"address\"}],\"name\":\"revokeMinter\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getMinters\",\"outputs\":[{\"internalType\":\"address[]\",\"name\":\"\",\"type\":\"address[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address[]\",\"name\":\"minters\",\"type\":\"address[]\"}],\"name\":\"getMinterAllowance\",\"outputs\":[{\"internalType\":\"uint256[]\",\"name\":\"\",\"type\":\"uint256[]\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"mint\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"burn\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"burnFrom\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"spender\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"sender\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"recipient\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"amount\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"pause\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"unpause\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]"

// XCoin is an auto generated Go binding around an Ethereum contract.
type XCoin struct {
	XCoinCaller     // Read-only binding to the contract
	XCoinTransactor // Write-only binding to the contract
	XCoinFilterer   // Log filterer for contract events
}

// XCoinCaller is an auto generated read-only Go binding around an Ethereum contract.
type XCoinCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// XCoinTransactor is an auto generated write-only Go binding around an Ethereum contract.
type XCoinTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// XCoinFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type XCoinFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// XCoinSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type XCoinSession struct {
	Contract     *XCoin            // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// XCoinCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type XCoinCallerSession struct {
	Contract *XCoinCaller  // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// XCoinTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type XCoinTransactorSession struct {
	Contract     *XCoinTransactor  // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// XCoinRaw is an auto generated low-level Go binding around an Ethereum contract.
type XCoinRaw struct {
	Contract *XCoin // Generic contract binding to access the raw methods on
}

// XCoinCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type XCoinCallerRaw struct {
	Contract *XCoinCaller // Generic read-only contract binding to access the raw methods on
}

// XCoinTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type XCoinTransactorRaw struct {
	Contract *XCoinTransactor // Generic write-only contract binding to access the raw methods on
}

// NewXCoin creates a new instance of XCoin, bound to a specific deployed contract.
func NewXCoin(address common.Address, backend bind.ContractBackend) (*XCoin, error) {
	contract, err := bindXCoin(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &XCoin{XCoinCaller: XCoinCaller{contract: contract}, XCoinTransactor: XCoinTransactor{contract: contract}, XCoinFilterer: XCoinFilterer{contract: contract}}, nil
}

// NewXCoinCaller creates a new read-only instance of XCoin, bound to a specific deployed contract.
func NewXCoinCaller(address common.Address, caller bind.ContractCaller) (*XCoinCaller, error) {
	contract, err := bindXCoin(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &XCoinCaller{contract: contract}, nil
}

// NewXCoinTransactor creates a new write-only instance of XCoin, bound to a specific deployed contract.
func NewXCoinTransactor(address common.Address, transactor bind.ContractTransactor) (*XCoinTransactor, error) {
	contract, err := bindXCoin(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &XCoinTransactor{contract: contract}, nil
}

// NewXCoinFilterer creates a new log filterer instance of XCoin, bound to a specific deployed contract.
func NewXCoinFilterer(address common.Address, filterer bind.ContractFilterer) (*XCoinFilterer, error) {
	contract, err := bindXCoin(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &XCoinFilterer{contract: contract}, nil
}

// bindXCoin binds a generic wrapper to an already deployed contract.
func bindXCoin(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(XCoinABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_XCoin *XCoinRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _XCoin.Contract.XCoinCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_XCoin *XCoinRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _XCoin.Contract.XCoinTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_XCoin *XCoinRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _XCoin.Contract.XCoinTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_XCoin *XCoinCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _XCoin.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_XCoin *XCoinTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _XCoin.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_XCoin *XCoinTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _XCoin.Contract.contract.Transact(opts, method, params...)
}

// DEFAULTADMINROLE is a free data retrieval call binding the contract method 0xa217fddf.
//
// Solidity: function DEFAULT_ADMIN_ROLE() view returns(bytes32)
func (_XCoin *XCoinCaller) DEFAULTADMINROLE(opts *bind.CallOpts) ([32]byte, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "DEFAULT_ADMIN_ROLE")

	if err != nil {
		return *new([32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)

	return out0, err

}

// DEFAULTADMINROLE is a free data retrieval call binding the contract method 0xa217fddf.
//
// Solidity: function DEFAULT_ADMIN_ROLE() view returns(bytes32)
func (_XCoin *XCoinSession) DEFAULTADMINROLE() ([32]byte, error) {
	return _XCoin.Contract.DEFAULTADMINROLE(&_XCoin.CallOpts)
}

// DEFAULTADMINROLE is a free data retrieval call binding the contract method 0xa217fddf.
//
// Solidity: function DEFAULT_ADMIN_ROLE() view returns(bytes32)
func (_XCoin *XCoinCallerSession) DEFAULTADMINROLE() ([32]byte, error) {
	return _XCoin.Contract.DEFAULTADMINROLE(&_XCoin.CallOpts)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(address owner, address spender) view returns(uint256)
func (_XCoin *XCoinCaller) Allowance(opts *bind.CallOpts, owner common.Address, spender common.Address) (*big.Int, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "allowance", owner, spender)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(address owner, address spender) view returns(uint256)
func (_XCoin *XCoinSession) Allowance(owner common.Address, spender common.Address) (*big.Int, error) {
	return _XCoin.Contract.Allowance(&_XCoin.CallOpts, owner, spender)
}

// Allowance is a free data retrieval call binding the contract method 0xdd62ed3e.
//
// Solidity: function allowance(address owner, address spender) view returns(uint256)
func (_XCoin *XCoinCallerSession) Allowance(owner common.Address, spender common.Address) (*big.Int, error) {
	return _XCoin.Contract.Allowance(&_XCoin.CallOpts, owner, spender)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address account) view returns(uint256)
func (_XCoin *XCoinCaller) BalanceOf(opts *bind.CallOpts, account common.Address) (*big.Int, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "balanceOf", account)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address account) view returns(uint256)
func (_XCoin *XCoinSession) BalanceOf(account common.Address) (*big.Int, error) {
	return _XCoin.Contract.BalanceOf(&_XCoin.CallOpts, account)
}

// BalanceOf is a free data retrieval call binding the contract method 0x70a08231.
//
// Solidity: function balanceOf(address account) view returns(uint256)
func (_XCoin *XCoinCallerSession) BalanceOf(account common.Address) (*big.Int, error) {
	return _XCoin.Contract.BalanceOf(&_XCoin.CallOpts, account)
}

// Cap is a free data retrieval call binding the contract method 0x355274ea.
//
// Solidity: function cap() view returns(uint256)
func (_XCoin *XCoinCaller) Cap(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "cap")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// Cap is a free data retrieval call binding the contract method 0x355274ea.
//
// Solidity: function cap() view returns(uint256)
func (_XCoin *XCoinSession) Cap() (*big.Int, error) {
	return _XCoin.Contract.Cap(&_XCoin.CallOpts)
}

// Cap is a free data retrieval call binding the contract method 0x355274ea.
//
// Solidity: function cap() view returns(uint256)
func (_XCoin *XCoinCallerSession) Cap() (*big.Int, error) {
	return _XCoin.Contract.Cap(&_XCoin.CallOpts)
}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() view returns(uint8)
func (_XCoin *XCoinCaller) Decimals(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "decimals")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() view returns(uint8)
func (_XCoin *XCoinSession) Decimals() (uint8, error) {
	return _XCoin.Contract.Decimals(&_XCoin.CallOpts)
}

// Decimals is a free data retrieval call binding the contract method 0x313ce567.
//
// Solidity: function decimals() view returns(uint8)
func (_XCoin *XCoinCallerSession) Decimals() (uint8, error) {
	return _XCoin.Contract.Decimals(&_XCoin.CallOpts)
}

// GetMinterAllowance is a free data retrieval call binding the contract method 0xe0308731.
//
// Solidity: function getMinterAllowance(address[] minters) view returns(uint256[])
func (_XCoin *XCoinCaller) GetMinterAllowance(opts *bind.CallOpts, minters []common.Address) ([]*big.Int, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "getMinterAllowance", minters)

	if err != nil {
		return *new([]*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new([]*big.Int)).(*[]*big.Int)

	return out0, err

}

// GetMinterAllowance is a free data retrieval call binding the contract method 0xe0308731.
//
// Solidity: function getMinterAllowance(address[] minters) view returns(uint256[])
func (_XCoin *XCoinSession) GetMinterAllowance(minters []common.Address) ([]*big.Int, error) {
	return _XCoin.Contract.GetMinterAllowance(&_XCoin.CallOpts, minters)
}

// GetMinterAllowance is a free data retrieval call binding the contract method 0xe0308731.
//
// Solidity: function getMinterAllowance(address[] minters) view returns(uint256[])
func (_XCoin *XCoinCallerSession) GetMinterAllowance(minters []common.Address) ([]*big.Int, error) {
	return _XCoin.Contract.GetMinterAllowance(&_XCoin.CallOpts, minters)
}

// GetMinters is a free data retrieval call binding the contract method 0x6b32810b.
//
// Solidity: function getMinters() view returns(address[])
func (_XCoin *XCoinCaller) GetMinters(opts *bind.CallOpts) ([]common.Address, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "getMinters")

	if err != nil {
		return *new([]common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new([]common.Address)).(*[]common.Address)

	return out0, err

}

// GetMinters is a free data retrieval call binding the contract method 0x6b32810b.
//
// Solidity: function getMinters() view returns(address[])
func (_XCoin *XCoinSession) GetMinters() ([]common.Address, error) {
	return _XCoin.Contract.GetMinters(&_XCoin.CallOpts)
}

// GetMinters is a free data retrieval call binding the contract method 0x6b32810b.
//
// Solidity: function getMinters() view returns(address[])
func (_XCoin *XCoinCallerSession) GetMinters() ([]common.Address, error) {
	return _XCoin.Contract.GetMinters(&_XCoin.CallOpts)
}

// GetRoleAdmin is a free data retrieval call binding the contract method 0x248a9ca3.
//
// Solidity: function getRoleAdmin(bytes32 role) view returns(bytes32)
func (_XCoin *XCoinCaller) GetRoleAdmin(opts *bind.CallOpts, role [32]byte) ([32]byte, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "getRoleAdmin", role)

	if err != nil {
		return *new([32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)

	return out0, err

}

// GetRoleAdmin is a free data retrieval call binding the contract method 0x248a9ca3.
//
// Solidity: function getRoleAdmin(bytes32 role) view returns(bytes32)
func (_XCoin *XCoinSession) GetRoleAdmin(role [32]byte) ([32]byte, error) {
	return _XCoin.Contract.GetRoleAdmin(&_XCoin.CallOpts, role)
}

// GetRoleAdmin is a free data retrieval call binding the contract method 0x248a9ca3.
//
// Solidity: function getRoleAdmin(bytes32 role) view returns(bytes32)
func (_XCoin *XCoinCallerSession) GetRoleAdmin(role [32]byte) ([32]byte, error) {
	return _XCoin.Contract.GetRoleAdmin(&_XCoin.CallOpts, role)
}

// GetRoleMember is a free data retrieval call binding the contract method 0x9010d07c.
//
// Solidity: function getRoleMember(bytes32 role, uint256 index) view returns(address)
func (_XCoin *XCoinCaller) GetRoleMember(opts *bind.CallOpts, role [32]byte, index *big.Int) (common.Address, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "getRoleMember", role, index)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// GetRoleMember is a free data retrieval call binding the contract method 0x9010d07c.
//
// Solidity: function getRoleMember(bytes32 role, uint256 index) view returns(address)
func (_XCoin *XCoinSession) GetRoleMember(role [32]byte, index *big.Int) (common.Address, error) {
	return _XCoin.Contract.GetRoleMember(&_XCoin.CallOpts, role, index)
}

// GetRoleMember is a free data retrieval call binding the contract method 0x9010d07c.
//
// Solidity: function getRoleMember(bytes32 role, uint256 index) view returns(address)
func (_XCoin *XCoinCallerSession) GetRoleMember(role [32]byte, index *big.Int) (common.Address, error) {
	return _XCoin.Contract.GetRoleMember(&_XCoin.CallOpts, role, index)
}

// GetRoleMemberCount is a free data retrieval call binding the contract method 0xca15c873.
//
// Solidity: function getRoleMemberCount(bytes32 role) view returns(uint256)
func (_XCoin *XCoinCaller) GetRoleMemberCount(opts *bind.CallOpts, role [32]byte) (*big.Int, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "getRoleMemberCount", role)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetRoleMemberCount is a free data retrieval call binding the contract method 0xca15c873.
//
// Solidity: function getRoleMemberCount(bytes32 role) view returns(uint256)
func (_XCoin *XCoinSession) GetRoleMemberCount(role [32]byte) (*big.Int, error) {
	return _XCoin.Contract.GetRoleMemberCount(&_XCoin.CallOpts, role)
}

// GetRoleMemberCount is a free data retrieval call binding the contract method 0xca15c873.
//
// Solidity: function getRoleMemberCount(bytes32 role) view returns(uint256)
func (_XCoin *XCoinCallerSession) GetRoleMemberCount(role [32]byte) (*big.Int, error) {
	return _XCoin.Contract.GetRoleMemberCount(&_XCoin.CallOpts, role)
}

// GetRoleMembers is a free data retrieval call binding the contract method 0xa3246ad3.
//
// Solidity: function getRoleMembers(bytes32 role) view returns(address[])
func (_XCoin *XCoinCaller) GetRoleMembers(opts *bind.CallOpts, role [32]byte) ([]common.Address, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "getRoleMembers", role)

	if err != nil {
		return *new([]common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new([]common.Address)).(*[]common.Address)

	return out0, err

}

// GetRoleMembers is a free data retrieval call binding the contract method 0xa3246ad3.
//
// Solidity: function getRoleMembers(bytes32 role) view returns(address[])
func (_XCoin *XCoinSession) GetRoleMembers(role [32]byte) ([]common.Address, error) {
	return _XCoin.Contract.GetRoleMembers(&_XCoin.CallOpts, role)
}

// GetRoleMembers is a free data retrieval call binding the contract method 0xa3246ad3.
//
// Solidity: function getRoleMembers(bytes32 role) view returns(address[])
func (_XCoin *XCoinCallerSession) GetRoleMembers(role [32]byte) ([]common.Address, error) {
	return _XCoin.Contract.GetRoleMembers(&_XCoin.CallOpts, role)
}

// GetRoles is a free data retrieval call binding the contract method 0x71061398.
//
// Solidity: function getRoles() pure returns((bytes32,string)[])
func (_XCoin *XCoinCaller) GetRoles(opts *bind.CallOpts) ([]RoleAccessRole, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "getRoles")

	if err != nil {
		return *new([]RoleAccessRole), err
	}

	out0 := *abi.ConvertType(out[0], new([]RoleAccessRole)).(*[]RoleAccessRole)

	return out0, err

}

// GetRoles is a free data retrieval call binding the contract method 0x71061398.
//
// Solidity: function getRoles() pure returns((bytes32,string)[])
func (_XCoin *XCoinSession) GetRoles() ([]RoleAccessRole, error) {
	return _XCoin.Contract.GetRoles(&_XCoin.CallOpts)
}

// GetRoles is a free data retrieval call binding the contract method 0x71061398.
//
// Solidity: function getRoles() pure returns((bytes32,string)[])
func (_XCoin *XCoinCallerSession) GetRoles() ([]RoleAccessRole, error) {
	return _XCoin.Contract.GetRoles(&_XCoin.CallOpts)
}

// HasRole is a free data retrieval call binding the contract method 0x91d14854.
//
// Solidity: function hasRole(bytes32 role, address account) view returns(bool)
func (_XCoin *XCoinCaller) HasRole(opts *bind.CallOpts, role [32]byte, account common.Address) (bool, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "hasRole", role, account)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// HasRole is a free data retrieval call binding the contract method 0x91d14854.
//
// Solidity: function hasRole(bytes32 role, address account) view returns(bool)
func (_XCoin *XCoinSession) HasRole(role [32]byte, account common.Address) (bool, error) {
	return _XCoin.Contract.HasRole(&_XCoin.CallOpts, role, account)
}

// HasRole is a free data retrieval call binding the contract method 0x91d14854.
//
// Solidity: function hasRole(bytes32 role, address account) view returns(bool)
func (_XCoin *XCoinCallerSession) HasRole(role [32]byte, account common.Address) (bool, error) {
	return _XCoin.Contract.HasRole(&_XCoin.CallOpts, role, account)
}

// IsBlacklisted is a free data retrieval call binding the contract method 0xfe575a87.
//
// Solidity: function isBlacklisted(address account) view returns(bool)
func (_XCoin *XCoinCaller) IsBlacklisted(opts *bind.CallOpts, account common.Address) (bool, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "isBlacklisted", account)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsBlacklisted is a free data retrieval call binding the contract method 0xfe575a87.
//
// Solidity: function isBlacklisted(address account) view returns(bool)
func (_XCoin *XCoinSession) IsBlacklisted(account common.Address) (bool, error) {
	return _XCoin.Contract.IsBlacklisted(&_XCoin.CallOpts, account)
}

// IsBlacklisted is a free data retrieval call binding the contract method 0xfe575a87.
//
// Solidity: function isBlacklisted(address account) view returns(bool)
func (_XCoin *XCoinCallerSession) IsBlacklisted(account common.Address) (bool, error) {
	return _XCoin.Contract.IsBlacklisted(&_XCoin.CallOpts, account)
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_XCoin *XCoinCaller) Name(opts *bind.CallOpts) (string, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "name")

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_XCoin *XCoinSession) Name() (string, error) {
	return _XCoin.Contract.Name(&_XCoin.CallOpts)
}

// Name is a free data retrieval call binding the contract method 0x06fdde03.
//
// Solidity: function name() view returns(string)
func (_XCoin *XCoinCallerSession) Name() (string, error) {
	return _XCoin.Contract.Name(&_XCoin.CallOpts)
}

// Paused is a free data retrieval call binding the contract method 0x5c975abb.
//
// Solidity: function paused() view returns(bool)
func (_XCoin *XCoinCaller) Paused(opts *bind.CallOpts) (bool, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "paused")

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// Paused is a free data retrieval call binding the contract method 0x5c975abb.
//
// Solidity: function paused() view returns(bool)
func (_XCoin *XCoinSession) Paused() (bool, error) {
	return _XCoin.Contract.Paused(&_XCoin.CallOpts)
}

// Paused is a free data retrieval call binding the contract method 0x5c975abb.
//
// Solidity: function paused() view returns(bool)
func (_XCoin *XCoinCallerSession) Paused() (bool, error) {
	return _XCoin.Contract.Paused(&_XCoin.CallOpts)
}

// SupportsInterface is a free data retrieval call binding the contract method 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (_XCoin *XCoinCaller) SupportsInterface(opts *bind.CallOpts, interfaceId [4]byte) (bool, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "supportsInterface", interfaceId)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// SupportsInterface is a free data retrieval call binding the contract method 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (_XCoin *XCoinSession) SupportsInterface(interfaceId [4]byte) (bool, error) {
	return _XCoin.Contract.SupportsInterface(&_XCoin.CallOpts, interfaceId)
}

// SupportsInterface is a free data retrieval call binding the contract method 0x01ffc9a7.
//
// Solidity: function supportsInterface(bytes4 interfaceId) view returns(bool)
func (_XCoin *XCoinCallerSession) SupportsInterface(interfaceId [4]byte) (bool, error) {
	return _XCoin.Contract.SupportsInterface(&_XCoin.CallOpts, interfaceId)
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_XCoin *XCoinCaller) Symbol(opts *bind.CallOpts) (string, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "symbol")

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_XCoin *XCoinSession) Symbol() (string, error) {
	return _XCoin.Contract.Symbol(&_XCoin.CallOpts)
}

// Symbol is a free data retrieval call binding the contract method 0x95d89b41.
//
// Solidity: function symbol() view returns(string)
func (_XCoin *XCoinCallerSession) Symbol() (string, error) {
	return _XCoin.Contract.Symbol(&_XCoin.CallOpts)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() view returns(uint256)
func (_XCoin *XCoinCaller) TotalSupply(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _XCoin.contract.Call(opts, &out, "totalSupply")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() view returns(uint256)
func (_XCoin *XCoinSession) TotalSupply() (*big.Int, error) {
	return _XCoin.Contract.TotalSupply(&_XCoin.CallOpts)
}

// TotalSupply is a free data retrieval call binding the contract method 0x18160ddd.
//
// Solidity: function totalSupply() view returns(uint256)
func (_XCoin *XCoinCallerSession) TotalSupply() (*big.Int, error) {
	return _XCoin.Contract.TotalSupply(&_XCoin.CallOpts)
}

// AddRoleMember is a paid mutator transaction binding the contract method 0x1b65471f.
//
// Solidity: function addRoleMember(bytes32 role, address member) returns(bool)
func (_XCoin *XCoinTransactor) AddRoleMember(opts *bind.TransactOpts, role [32]byte, member common.Address) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "addRoleMember", role, member)
}

// AddRoleMember is a paid mutator transaction binding the contract method 0x1b65471f.
//
// Solidity: function addRoleMember(bytes32 role, address member) returns(bool)
func (_XCoin *XCoinSession) AddRoleMember(role [32]byte, member common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.AddRoleMember(&_XCoin.TransactOpts, role, member)
}

// AddRoleMember is a paid mutator transaction binding the contract method 0x1b65471f.
//
// Solidity: function addRoleMember(bytes32 role, address member) returns(bool)
func (_XCoin *XCoinTransactorSession) AddRoleMember(role [32]byte, member common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.AddRoleMember(&_XCoin.TransactOpts, role, member)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address spender, uint256 amount) returns(bool)
func (_XCoin *XCoinTransactor) Approve(opts *bind.TransactOpts, spender common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "approve", spender, amount)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address spender, uint256 amount) returns(bool)
func (_XCoin *XCoinSession) Approve(spender common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.Approve(&_XCoin.TransactOpts, spender, amount)
}

// Approve is a paid mutator transaction binding the contract method 0x095ea7b3.
//
// Solidity: function approve(address spender, uint256 amount) returns(bool)
func (_XCoin *XCoinTransactorSession) Approve(spender common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.Approve(&_XCoin.TransactOpts, spender, amount)
}

// Blacklist is a paid mutator transaction binding the contract method 0xf9f92be4.
//
// Solidity: function blacklist(address account) returns()
func (_XCoin *XCoinTransactor) Blacklist(opts *bind.TransactOpts, account common.Address) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "blacklist", account)
}

// Blacklist is a paid mutator transaction binding the contract method 0xf9f92be4.
//
// Solidity: function blacklist(address account) returns()
func (_XCoin *XCoinSession) Blacklist(account common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.Blacklist(&_XCoin.TransactOpts, account)
}

// Blacklist is a paid mutator transaction binding the contract method 0xf9f92be4.
//
// Solidity: function blacklist(address account) returns()
func (_XCoin *XCoinTransactorSession) Blacklist(account common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.Blacklist(&_XCoin.TransactOpts, account)
}

// Burn is a paid mutator transaction binding the contract method 0x42966c68.
//
// Solidity: function burn(uint256 amount) returns()
func (_XCoin *XCoinTransactor) Burn(opts *bind.TransactOpts, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "burn", amount)
}

// Burn is a paid mutator transaction binding the contract method 0x42966c68.
//
// Solidity: function burn(uint256 amount) returns()
func (_XCoin *XCoinSession) Burn(amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.Burn(&_XCoin.TransactOpts, amount)
}

// Burn is a paid mutator transaction binding the contract method 0x42966c68.
//
// Solidity: function burn(uint256 amount) returns()
func (_XCoin *XCoinTransactorSession) Burn(amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.Burn(&_XCoin.TransactOpts, amount)
}

// BurnFrom is a paid mutator transaction binding the contract method 0x79cc6790.
//
// Solidity: function burnFrom(address account, uint256 amount) returns()
func (_XCoin *XCoinTransactor) BurnFrom(opts *bind.TransactOpts, account common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "burnFrom", account, amount)
}

// BurnFrom is a paid mutator transaction binding the contract method 0x79cc6790.
//
// Solidity: function burnFrom(address account, uint256 amount) returns()
func (_XCoin *XCoinSession) BurnFrom(account common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.BurnFrom(&_XCoin.TransactOpts, account, amount)
}

// BurnFrom is a paid mutator transaction binding the contract method 0x79cc6790.
//
// Solidity: function burnFrom(address account, uint256 amount) returns()
func (_XCoin *XCoinTransactorSession) BurnFrom(account common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.BurnFrom(&_XCoin.TransactOpts, account, amount)
}

// DecreaseAllowance is a paid mutator transaction binding the contract method 0xa457c2d7.
//
// Solidity: function decreaseAllowance(address spender, uint256 subtractedValue) returns(bool)
func (_XCoin *XCoinTransactor) DecreaseAllowance(opts *bind.TransactOpts, spender common.Address, subtractedValue *big.Int) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "decreaseAllowance", spender, subtractedValue)
}

// DecreaseAllowance is a paid mutator transaction binding the contract method 0xa457c2d7.
//
// Solidity: function decreaseAllowance(address spender, uint256 subtractedValue) returns(bool)
func (_XCoin *XCoinSession) DecreaseAllowance(spender common.Address, subtractedValue *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.DecreaseAllowance(&_XCoin.TransactOpts, spender, subtractedValue)
}

// DecreaseAllowance is a paid mutator transaction binding the contract method 0xa457c2d7.
//
// Solidity: function decreaseAllowance(address spender, uint256 subtractedValue) returns(bool)
func (_XCoin *XCoinTransactorSession) DecreaseAllowance(spender common.Address, subtractedValue *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.DecreaseAllowance(&_XCoin.TransactOpts, spender, subtractedValue)
}

// GrantMinter is a paid mutator transaction binding the contract method 0x989fba2d.
//
// Solidity: function grantMinter(address minter, uint256 allowance) returns(bool)
func (_XCoin *XCoinTransactor) GrantMinter(opts *bind.TransactOpts, minter common.Address, allowance *big.Int) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "grantMinter", minter, allowance)
}

// GrantMinter is a paid mutator transaction binding the contract method 0x989fba2d.
//
// Solidity: function grantMinter(address minter, uint256 allowance) returns(bool)
func (_XCoin *XCoinSession) GrantMinter(minter common.Address, allowance *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.GrantMinter(&_XCoin.TransactOpts, minter, allowance)
}

// GrantMinter is a paid mutator transaction binding the contract method 0x989fba2d.
//
// Solidity: function grantMinter(address minter, uint256 allowance) returns(bool)
func (_XCoin *XCoinTransactorSession) GrantMinter(minter common.Address, allowance *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.GrantMinter(&_XCoin.TransactOpts, minter, allowance)
}

// GrantRole is a paid mutator transaction binding the contract method 0x2f2ff15d.
//
// Solidity: function grantRole(bytes32 role, address account) returns()
func (_XCoin *XCoinTransactor) GrantRole(opts *bind.TransactOpts, role [32]byte, account common.Address) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "grantRole", role, account)
}

// GrantRole is a paid mutator transaction binding the contract method 0x2f2ff15d.
//
// Solidity: function grantRole(bytes32 role, address account) returns()
func (_XCoin *XCoinSession) GrantRole(role [32]byte, account common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.GrantRole(&_XCoin.TransactOpts, role, account)
}

// GrantRole is a paid mutator transaction binding the contract method 0x2f2ff15d.
//
// Solidity: function grantRole(bytes32 role, address account) returns()
func (_XCoin *XCoinTransactorSession) GrantRole(role [32]byte, account common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.GrantRole(&_XCoin.TransactOpts, role, account)
}

// IncreaseAllowance is a paid mutator transaction binding the contract method 0x39509351.
//
// Solidity: function increaseAllowance(address spender, uint256 addedValue) returns(bool)
func (_XCoin *XCoinTransactor) IncreaseAllowance(opts *bind.TransactOpts, spender common.Address, addedValue *big.Int) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "increaseAllowance", spender, addedValue)
}

// IncreaseAllowance is a paid mutator transaction binding the contract method 0x39509351.
//
// Solidity: function increaseAllowance(address spender, uint256 addedValue) returns(bool)
func (_XCoin *XCoinSession) IncreaseAllowance(spender common.Address, addedValue *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.IncreaseAllowance(&_XCoin.TransactOpts, spender, addedValue)
}

// IncreaseAllowance is a paid mutator transaction binding the contract method 0x39509351.
//
// Solidity: function increaseAllowance(address spender, uint256 addedValue) returns(bool)
func (_XCoin *XCoinTransactorSession) IncreaseAllowance(spender common.Address, addedValue *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.IncreaseAllowance(&_XCoin.TransactOpts, spender, addedValue)
}

// Mint is a paid mutator transaction binding the contract method 0x40c10f19.
//
// Solidity: function mint(address account, uint256 amount) returns()
func (_XCoin *XCoinTransactor) Mint(opts *bind.TransactOpts, account common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "mint", account, amount)
}

// Mint is a paid mutator transaction binding the contract method 0x40c10f19.
//
// Solidity: function mint(address account, uint256 amount) returns()
func (_XCoin *XCoinSession) Mint(account common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.Mint(&_XCoin.TransactOpts, account, amount)
}

// Mint is a paid mutator transaction binding the contract method 0x40c10f19.
//
// Solidity: function mint(address account, uint256 amount) returns()
func (_XCoin *XCoinTransactorSession) Mint(account common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.Mint(&_XCoin.TransactOpts, account, amount)
}

// Pause is a paid mutator transaction binding the contract method 0x8456cb59.
//
// Solidity: function pause() returns()
func (_XCoin *XCoinTransactor) Pause(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "pause")
}

// Pause is a paid mutator transaction binding the contract method 0x8456cb59.
//
// Solidity: function pause() returns()
func (_XCoin *XCoinSession) Pause() (*types.Transaction, error) {
	return _XCoin.Contract.Pause(&_XCoin.TransactOpts)
}

// Pause is a paid mutator transaction binding the contract method 0x8456cb59.
//
// Solidity: function pause() returns()
func (_XCoin *XCoinTransactorSession) Pause() (*types.Transaction, error) {
	return _XCoin.Contract.Pause(&_XCoin.TransactOpts)
}

// RemoveRoleMember is a paid mutator transaction binding the contract method 0x4dd8fac8.
//
// Solidity: function removeRoleMember(bytes32 role, address member) returns(bool)
func (_XCoin *XCoinTransactor) RemoveRoleMember(opts *bind.TransactOpts, role [32]byte, member common.Address) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "removeRoleMember", role, member)
}

// RemoveRoleMember is a paid mutator transaction binding the contract method 0x4dd8fac8.
//
// Solidity: function removeRoleMember(bytes32 role, address member) returns(bool)
func (_XCoin *XCoinSession) RemoveRoleMember(role [32]byte, member common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.RemoveRoleMember(&_XCoin.TransactOpts, role, member)
}

// RemoveRoleMember is a paid mutator transaction binding the contract method 0x4dd8fac8.
//
// Solidity: function removeRoleMember(bytes32 role, address member) returns(bool)
func (_XCoin *XCoinTransactorSession) RemoveRoleMember(role [32]byte, member common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.RemoveRoleMember(&_XCoin.TransactOpts, role, member)
}

// RenounceRole is a paid mutator transaction binding the contract method 0x36568abe.
//
// Solidity: function renounceRole(bytes32 role, address account) returns()
func (_XCoin *XCoinTransactor) RenounceRole(opts *bind.TransactOpts, role [32]byte, account common.Address) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "renounceRole", role, account)
}

// RenounceRole is a paid mutator transaction binding the contract method 0x36568abe.
//
// Solidity: function renounceRole(bytes32 role, address account) returns()
func (_XCoin *XCoinSession) RenounceRole(role [32]byte, account common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.RenounceRole(&_XCoin.TransactOpts, role, account)
}

// RenounceRole is a paid mutator transaction binding the contract method 0x36568abe.
//
// Solidity: function renounceRole(bytes32 role, address account) returns()
func (_XCoin *XCoinTransactorSession) RenounceRole(role [32]byte, account common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.RenounceRole(&_XCoin.TransactOpts, role, account)
}

// RevokeMinter is a paid mutator transaction binding the contract method 0xcfbd4885.
//
// Solidity: function revokeMinter(address minter) returns(bool)
func (_XCoin *XCoinTransactor) RevokeMinter(opts *bind.TransactOpts, minter common.Address) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "revokeMinter", minter)
}

// RevokeMinter is a paid mutator transaction binding the contract method 0xcfbd4885.
//
// Solidity: function revokeMinter(address minter) returns(bool)
func (_XCoin *XCoinSession) RevokeMinter(minter common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.RevokeMinter(&_XCoin.TransactOpts, minter)
}

// RevokeMinter is a paid mutator transaction binding the contract method 0xcfbd4885.
//
// Solidity: function revokeMinter(address minter) returns(bool)
func (_XCoin *XCoinTransactorSession) RevokeMinter(minter common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.RevokeMinter(&_XCoin.TransactOpts, minter)
}

// RevokeRole is a paid mutator transaction binding the contract method 0xd547741f.
//
// Solidity: function revokeRole(bytes32 role, address account) returns()
func (_XCoin *XCoinTransactor) RevokeRole(opts *bind.TransactOpts, role [32]byte, account common.Address) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "revokeRole", role, account)
}

// RevokeRole is a paid mutator transaction binding the contract method 0xd547741f.
//
// Solidity: function revokeRole(bytes32 role, address account) returns()
func (_XCoin *XCoinSession) RevokeRole(role [32]byte, account common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.RevokeRole(&_XCoin.TransactOpts, role, account)
}

// RevokeRole is a paid mutator transaction binding the contract method 0xd547741f.
//
// Solidity: function revokeRole(bytes32 role, address account) returns()
func (_XCoin *XCoinTransactorSession) RevokeRole(role [32]byte, account common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.RevokeRole(&_XCoin.TransactOpts, role, account)
}

// SetCap is a paid mutator transaction binding the contract method 0x47786d37.
//
// Solidity: function setCap(uint256 cap_) returns(uint256)
func (_XCoin *XCoinTransactor) SetCap(opts *bind.TransactOpts, cap_ *big.Int) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "setCap", cap_)
}

// SetCap is a paid mutator transaction binding the contract method 0x47786d37.
//
// Solidity: function setCap(uint256 cap_) returns(uint256)
func (_XCoin *XCoinSession) SetCap(cap_ *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.SetCap(&_XCoin.TransactOpts, cap_)
}

// SetCap is a paid mutator transaction binding the contract method 0x47786d37.
//
// Solidity: function setCap(uint256 cap_) returns(uint256)
func (_XCoin *XCoinTransactorSession) SetCap(cap_ *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.SetCap(&_XCoin.TransactOpts, cap_)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(address recipient, uint256 amount) returns(bool)
func (_XCoin *XCoinTransactor) Transfer(opts *bind.TransactOpts, recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "transfer", recipient, amount)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(address recipient, uint256 amount) returns(bool)
func (_XCoin *XCoinSession) Transfer(recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.Transfer(&_XCoin.TransactOpts, recipient, amount)
}

// Transfer is a paid mutator transaction binding the contract method 0xa9059cbb.
//
// Solidity: function transfer(address recipient, uint256 amount) returns(bool)
func (_XCoin *XCoinTransactorSession) Transfer(recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.Transfer(&_XCoin.TransactOpts, recipient, amount)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address sender, address recipient, uint256 amount) returns(bool)
func (_XCoin *XCoinTransactor) TransferFrom(opts *bind.TransactOpts, sender common.Address, recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "transferFrom", sender, recipient, amount)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address sender, address recipient, uint256 amount) returns(bool)
func (_XCoin *XCoinSession) TransferFrom(sender common.Address, recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.TransferFrom(&_XCoin.TransactOpts, sender, recipient, amount)
}

// TransferFrom is a paid mutator transaction binding the contract method 0x23b872dd.
//
// Solidity: function transferFrom(address sender, address recipient, uint256 amount) returns(bool)
func (_XCoin *XCoinTransactorSession) TransferFrom(sender common.Address, recipient common.Address, amount *big.Int) (*types.Transaction, error) {
	return _XCoin.Contract.TransferFrom(&_XCoin.TransactOpts, sender, recipient, amount)
}

// UnBlacklist is a paid mutator transaction binding the contract method 0x1a895266.
//
// Solidity: function unBlacklist(address account) returns()
func (_XCoin *XCoinTransactor) UnBlacklist(opts *bind.TransactOpts, account common.Address) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "unBlacklist", account)
}

// UnBlacklist is a paid mutator transaction binding the contract method 0x1a895266.
//
// Solidity: function unBlacklist(address account) returns()
func (_XCoin *XCoinSession) UnBlacklist(account common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.UnBlacklist(&_XCoin.TransactOpts, account)
}

// UnBlacklist is a paid mutator transaction binding the contract method 0x1a895266.
//
// Solidity: function unBlacklist(address account) returns()
func (_XCoin *XCoinTransactorSession) UnBlacklist(account common.Address) (*types.Transaction, error) {
	return _XCoin.Contract.UnBlacklist(&_XCoin.TransactOpts, account)
}

// Unpause is a paid mutator transaction binding the contract method 0x3f4ba83a.
//
// Solidity: function unpause() returns()
func (_XCoin *XCoinTransactor) Unpause(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _XCoin.contract.Transact(opts, "unpause")
}

// Unpause is a paid mutator transaction binding the contract method 0x3f4ba83a.
//
// Solidity: function unpause() returns()
func (_XCoin *XCoinSession) Unpause() (*types.Transaction, error) {
	return _XCoin.Contract.Unpause(&_XCoin.TransactOpts)
}

// Unpause is a paid mutator transaction binding the contract method 0x3f4ba83a.
//
// Solidity: function unpause() returns()
func (_XCoin *XCoinTransactorSession) Unpause() (*types.Transaction, error) {
	return _XCoin.Contract.Unpause(&_XCoin.TransactOpts)
}

// XCoinApprovalIterator is returned from FilterApproval and is used to iterate over the raw logs and unpacked data for Approval events raised by the XCoin contract.
type XCoinApprovalIterator struct {
	Event *XCoinApproval // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *XCoinApprovalIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(XCoinApproval)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(XCoinApproval)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *XCoinApprovalIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *XCoinApprovalIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// XCoinApproval represents a Approval event raised by the XCoin contract.
type XCoinApproval struct {
	Owner   common.Address
	Spender common.Address
	Value   *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterApproval is a free log retrieval operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed spender, uint256 value)
func (_XCoin *XCoinFilterer) FilterApproval(opts *bind.FilterOpts, owner []common.Address, spender []common.Address) (*XCoinApprovalIterator, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var spenderRule []interface{}
	for _, spenderItem := range spender {
		spenderRule = append(spenderRule, spenderItem)
	}

	logs, sub, err := _XCoin.contract.FilterLogs(opts, "Approval", ownerRule, spenderRule)
	if err != nil {
		return nil, err
	}
	return &XCoinApprovalIterator{contract: _XCoin.contract, event: "Approval", logs: logs, sub: sub}, nil
}

// WatchApproval is a free log subscription operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed spender, uint256 value)
func (_XCoin *XCoinFilterer) WatchApproval(opts *bind.WatchOpts, sink chan<- *XCoinApproval, owner []common.Address, spender []common.Address) (event.Subscription, error) {

	var ownerRule []interface{}
	for _, ownerItem := range owner {
		ownerRule = append(ownerRule, ownerItem)
	}
	var spenderRule []interface{}
	for _, spenderItem := range spender {
		spenderRule = append(spenderRule, spenderItem)
	}

	logs, sub, err := _XCoin.contract.WatchLogs(opts, "Approval", ownerRule, spenderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(XCoinApproval)
				if err := _XCoin.contract.UnpackLog(event, "Approval", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseApproval is a log parse operation binding the contract event 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925.
//
// Solidity: event Approval(address indexed owner, address indexed spender, uint256 value)
func (_XCoin *XCoinFilterer) ParseApproval(log types.Log) (*XCoinApproval, error) {
	event := new(XCoinApproval)
	if err := _XCoin.contract.UnpackLog(event, "Approval", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// XCoinBlacklistedIterator is returned from FilterBlacklisted and is used to iterate over the raw logs and unpacked data for Blacklisted events raised by the XCoin contract.
type XCoinBlacklistedIterator struct {
	Event *XCoinBlacklisted // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *XCoinBlacklistedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(XCoinBlacklisted)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(XCoinBlacklisted)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *XCoinBlacklistedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *XCoinBlacklistedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// XCoinBlacklisted represents a Blacklisted event raised by the XCoin contract.
type XCoinBlacklisted struct {
	Account common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterBlacklisted is a free log retrieval operation binding the contract event 0xffa4e6181777692565cf28528fc88fd1516ea86b56da075235fa575af6a4b855.
//
// Solidity: event Blacklisted(address indexed _account)
func (_XCoin *XCoinFilterer) FilterBlacklisted(opts *bind.FilterOpts, _account []common.Address) (*XCoinBlacklistedIterator, error) {

	var _accountRule []interface{}
	for _, _accountItem := range _account {
		_accountRule = append(_accountRule, _accountItem)
	}

	logs, sub, err := _XCoin.contract.FilterLogs(opts, "Blacklisted", _accountRule)
	if err != nil {
		return nil, err
	}
	return &XCoinBlacklistedIterator{contract: _XCoin.contract, event: "Blacklisted", logs: logs, sub: sub}, nil
}

// WatchBlacklisted is a free log subscription operation binding the contract event 0xffa4e6181777692565cf28528fc88fd1516ea86b56da075235fa575af6a4b855.
//
// Solidity: event Blacklisted(address indexed _account)
func (_XCoin *XCoinFilterer) WatchBlacklisted(opts *bind.WatchOpts, sink chan<- *XCoinBlacklisted, _account []common.Address) (event.Subscription, error) {

	var _accountRule []interface{}
	for _, _accountItem := range _account {
		_accountRule = append(_accountRule, _accountItem)
	}

	logs, sub, err := _XCoin.contract.WatchLogs(opts, "Blacklisted", _accountRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(XCoinBlacklisted)
				if err := _XCoin.contract.UnpackLog(event, "Blacklisted", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseBlacklisted is a log parse operation binding the contract event 0xffa4e6181777692565cf28528fc88fd1516ea86b56da075235fa575af6a4b855.
//
// Solidity: event Blacklisted(address indexed _account)
func (_XCoin *XCoinFilterer) ParseBlacklisted(log types.Log) (*XCoinBlacklisted, error) {
	event := new(XCoinBlacklisted)
	if err := _XCoin.contract.UnpackLog(event, "Blacklisted", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// XCoinPausedIterator is returned from FilterPaused and is used to iterate over the raw logs and unpacked data for Paused events raised by the XCoin contract.
type XCoinPausedIterator struct {
	Event *XCoinPaused // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *XCoinPausedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(XCoinPaused)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(XCoinPaused)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *XCoinPausedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *XCoinPausedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// XCoinPaused represents a Paused event raised by the XCoin contract.
type XCoinPaused struct {
	Account common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterPaused is a free log retrieval operation binding the contract event 0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258.
//
// Solidity: event Paused(address account)
func (_XCoin *XCoinFilterer) FilterPaused(opts *bind.FilterOpts) (*XCoinPausedIterator, error) {

	logs, sub, err := _XCoin.contract.FilterLogs(opts, "Paused")
	if err != nil {
		return nil, err
	}
	return &XCoinPausedIterator{contract: _XCoin.contract, event: "Paused", logs: logs, sub: sub}, nil
}

// WatchPaused is a free log subscription operation binding the contract event 0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258.
//
// Solidity: event Paused(address account)
func (_XCoin *XCoinFilterer) WatchPaused(opts *bind.WatchOpts, sink chan<- *XCoinPaused) (event.Subscription, error) {

	logs, sub, err := _XCoin.contract.WatchLogs(opts, "Paused")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(XCoinPaused)
				if err := _XCoin.contract.UnpackLog(event, "Paused", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParsePaused is a log parse operation binding the contract event 0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258.
//
// Solidity: event Paused(address account)
func (_XCoin *XCoinFilterer) ParsePaused(log types.Log) (*XCoinPaused, error) {
	event := new(XCoinPaused)
	if err := _XCoin.contract.UnpackLog(event, "Paused", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// XCoinRoleAdminChangedIterator is returned from FilterRoleAdminChanged and is used to iterate over the raw logs and unpacked data for RoleAdminChanged events raised by the XCoin contract.
type XCoinRoleAdminChangedIterator struct {
	Event *XCoinRoleAdminChanged // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *XCoinRoleAdminChangedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(XCoinRoleAdminChanged)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(XCoinRoleAdminChanged)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *XCoinRoleAdminChangedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *XCoinRoleAdminChangedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// XCoinRoleAdminChanged represents a RoleAdminChanged event raised by the XCoin contract.
type XCoinRoleAdminChanged struct {
	Role              [32]byte
	PreviousAdminRole [32]byte
	NewAdminRole      [32]byte
	Raw               types.Log // Blockchain specific contextual infos
}

// FilterRoleAdminChanged is a free log retrieval operation binding the contract event 0xbd79b86ffe0ab8e8776151514217cd7cacd52c909f66475c3af44e129f0b00ff.
//
// Solidity: event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
func (_XCoin *XCoinFilterer) FilterRoleAdminChanged(opts *bind.FilterOpts, role [][32]byte, previousAdminRole [][32]byte, newAdminRole [][32]byte) (*XCoinRoleAdminChangedIterator, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var previousAdminRoleRule []interface{}
	for _, previousAdminRoleItem := range previousAdminRole {
		previousAdminRoleRule = append(previousAdminRoleRule, previousAdminRoleItem)
	}
	var newAdminRoleRule []interface{}
	for _, newAdminRoleItem := range newAdminRole {
		newAdminRoleRule = append(newAdminRoleRule, newAdminRoleItem)
	}

	logs, sub, err := _XCoin.contract.FilterLogs(opts, "RoleAdminChanged", roleRule, previousAdminRoleRule, newAdminRoleRule)
	if err != nil {
		return nil, err
	}
	return &XCoinRoleAdminChangedIterator{contract: _XCoin.contract, event: "RoleAdminChanged", logs: logs, sub: sub}, nil
}

// WatchRoleAdminChanged is a free log subscription operation binding the contract event 0xbd79b86ffe0ab8e8776151514217cd7cacd52c909f66475c3af44e129f0b00ff.
//
// Solidity: event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
func (_XCoin *XCoinFilterer) WatchRoleAdminChanged(opts *bind.WatchOpts, sink chan<- *XCoinRoleAdminChanged, role [][32]byte, previousAdminRole [][32]byte, newAdminRole [][32]byte) (event.Subscription, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var previousAdminRoleRule []interface{}
	for _, previousAdminRoleItem := range previousAdminRole {
		previousAdminRoleRule = append(previousAdminRoleRule, previousAdminRoleItem)
	}
	var newAdminRoleRule []interface{}
	for _, newAdminRoleItem := range newAdminRole {
		newAdminRoleRule = append(newAdminRoleRule, newAdminRoleItem)
	}

	logs, sub, err := _XCoin.contract.WatchLogs(opts, "RoleAdminChanged", roleRule, previousAdminRoleRule, newAdminRoleRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(XCoinRoleAdminChanged)
				if err := _XCoin.contract.UnpackLog(event, "RoleAdminChanged", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseRoleAdminChanged is a log parse operation binding the contract event 0xbd79b86ffe0ab8e8776151514217cd7cacd52c909f66475c3af44e129f0b00ff.
//
// Solidity: event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
func (_XCoin *XCoinFilterer) ParseRoleAdminChanged(log types.Log) (*XCoinRoleAdminChanged, error) {
	event := new(XCoinRoleAdminChanged)
	if err := _XCoin.contract.UnpackLog(event, "RoleAdminChanged", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// XCoinRoleGrantedIterator is returned from FilterRoleGranted and is used to iterate over the raw logs and unpacked data for RoleGranted events raised by the XCoin contract.
type XCoinRoleGrantedIterator struct {
	Event *XCoinRoleGranted // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *XCoinRoleGrantedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(XCoinRoleGranted)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(XCoinRoleGranted)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *XCoinRoleGrantedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *XCoinRoleGrantedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// XCoinRoleGranted represents a RoleGranted event raised by the XCoin contract.
type XCoinRoleGranted struct {
	Role    [32]byte
	Account common.Address
	Sender  common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterRoleGranted is a free log retrieval operation binding the contract event 0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d.
//
// Solidity: event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
func (_XCoin *XCoinFilterer) FilterRoleGranted(opts *bind.FilterOpts, role [][32]byte, account []common.Address, sender []common.Address) (*XCoinRoleGrantedIterator, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var accountRule []interface{}
	for _, accountItem := range account {
		accountRule = append(accountRule, accountItem)
	}
	var senderRule []interface{}
	for _, senderItem := range sender {
		senderRule = append(senderRule, senderItem)
	}

	logs, sub, err := _XCoin.contract.FilterLogs(opts, "RoleGranted", roleRule, accountRule, senderRule)
	if err != nil {
		return nil, err
	}
	return &XCoinRoleGrantedIterator{contract: _XCoin.contract, event: "RoleGranted", logs: logs, sub: sub}, nil
}

// WatchRoleGranted is a free log subscription operation binding the contract event 0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d.
//
// Solidity: event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
func (_XCoin *XCoinFilterer) WatchRoleGranted(opts *bind.WatchOpts, sink chan<- *XCoinRoleGranted, role [][32]byte, account []common.Address, sender []common.Address) (event.Subscription, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var accountRule []interface{}
	for _, accountItem := range account {
		accountRule = append(accountRule, accountItem)
	}
	var senderRule []interface{}
	for _, senderItem := range sender {
		senderRule = append(senderRule, senderItem)
	}

	logs, sub, err := _XCoin.contract.WatchLogs(opts, "RoleGranted", roleRule, accountRule, senderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(XCoinRoleGranted)
				if err := _XCoin.contract.UnpackLog(event, "RoleGranted", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseRoleGranted is a log parse operation binding the contract event 0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d.
//
// Solidity: event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
func (_XCoin *XCoinFilterer) ParseRoleGranted(log types.Log) (*XCoinRoleGranted, error) {
	event := new(XCoinRoleGranted)
	if err := _XCoin.contract.UnpackLog(event, "RoleGranted", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// XCoinRoleRevokedIterator is returned from FilterRoleRevoked and is used to iterate over the raw logs and unpacked data for RoleRevoked events raised by the XCoin contract.
type XCoinRoleRevokedIterator struct {
	Event *XCoinRoleRevoked // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *XCoinRoleRevokedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(XCoinRoleRevoked)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(XCoinRoleRevoked)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *XCoinRoleRevokedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *XCoinRoleRevokedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// XCoinRoleRevoked represents a RoleRevoked event raised by the XCoin contract.
type XCoinRoleRevoked struct {
	Role    [32]byte
	Account common.Address
	Sender  common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterRoleRevoked is a free log retrieval operation binding the contract event 0xf6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b.
//
// Solidity: event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
func (_XCoin *XCoinFilterer) FilterRoleRevoked(opts *bind.FilterOpts, role [][32]byte, account []common.Address, sender []common.Address) (*XCoinRoleRevokedIterator, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var accountRule []interface{}
	for _, accountItem := range account {
		accountRule = append(accountRule, accountItem)
	}
	var senderRule []interface{}
	for _, senderItem := range sender {
		senderRule = append(senderRule, senderItem)
	}

	logs, sub, err := _XCoin.contract.FilterLogs(opts, "RoleRevoked", roleRule, accountRule, senderRule)
	if err != nil {
		return nil, err
	}
	return &XCoinRoleRevokedIterator{contract: _XCoin.contract, event: "RoleRevoked", logs: logs, sub: sub}, nil
}

// WatchRoleRevoked is a free log subscription operation binding the contract event 0xf6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b.
//
// Solidity: event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
func (_XCoin *XCoinFilterer) WatchRoleRevoked(opts *bind.WatchOpts, sink chan<- *XCoinRoleRevoked, role [][32]byte, account []common.Address, sender []common.Address) (event.Subscription, error) {

	var roleRule []interface{}
	for _, roleItem := range role {
		roleRule = append(roleRule, roleItem)
	}
	var accountRule []interface{}
	for _, accountItem := range account {
		accountRule = append(accountRule, accountItem)
	}
	var senderRule []interface{}
	for _, senderItem := range sender {
		senderRule = append(senderRule, senderItem)
	}

	logs, sub, err := _XCoin.contract.WatchLogs(opts, "RoleRevoked", roleRule, accountRule, senderRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(XCoinRoleRevoked)
				if err := _XCoin.contract.UnpackLog(event, "RoleRevoked", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseRoleRevoked is a log parse operation binding the contract event 0xf6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b.
//
// Solidity: event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
func (_XCoin *XCoinFilterer) ParseRoleRevoked(log types.Log) (*XCoinRoleRevoked, error) {
	event := new(XCoinRoleRevoked)
	if err := _XCoin.contract.UnpackLog(event, "RoleRevoked", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// XCoinTransferIterator is returned from FilterTransfer and is used to iterate over the raw logs and unpacked data for Transfer events raised by the XCoin contract.
type XCoinTransferIterator struct {
	Event *XCoinTransfer // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *XCoinTransferIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(XCoinTransfer)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(XCoinTransfer)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *XCoinTransferIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *XCoinTransferIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// XCoinTransfer represents a Transfer event raised by the XCoin contract.
type XCoinTransfer struct {
	From  common.Address
	To    common.Address
	Value *big.Int
	Raw   types.Log // Blockchain specific contextual infos
}

// FilterTransfer is a free log retrieval operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 value)
func (_XCoin *XCoinFilterer) FilterTransfer(opts *bind.FilterOpts, from []common.Address, to []common.Address) (*XCoinTransferIterator, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _XCoin.contract.FilterLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return &XCoinTransferIterator{contract: _XCoin.contract, event: "Transfer", logs: logs, sub: sub}, nil
}

// WatchTransfer is a free log subscription operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 value)
func (_XCoin *XCoinFilterer) WatchTransfer(opts *bind.WatchOpts, sink chan<- *XCoinTransfer, from []common.Address, to []common.Address) (event.Subscription, error) {

	var fromRule []interface{}
	for _, fromItem := range from {
		fromRule = append(fromRule, fromItem)
	}
	var toRule []interface{}
	for _, toItem := range to {
		toRule = append(toRule, toItem)
	}

	logs, sub, err := _XCoin.contract.WatchLogs(opts, "Transfer", fromRule, toRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(XCoinTransfer)
				if err := _XCoin.contract.UnpackLog(event, "Transfer", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseTransfer is a log parse operation binding the contract event 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef.
//
// Solidity: event Transfer(address indexed from, address indexed to, uint256 value)
func (_XCoin *XCoinFilterer) ParseTransfer(log types.Log) (*XCoinTransfer, error) {
	event := new(XCoinTransfer)
	if err := _XCoin.contract.UnpackLog(event, "Transfer", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// XCoinUnBlacklistedIterator is returned from FilterUnBlacklisted and is used to iterate over the raw logs and unpacked data for UnBlacklisted events raised by the XCoin contract.
type XCoinUnBlacklistedIterator struct {
	Event *XCoinUnBlacklisted // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *XCoinUnBlacklistedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(XCoinUnBlacklisted)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(XCoinUnBlacklisted)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *XCoinUnBlacklistedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *XCoinUnBlacklistedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// XCoinUnBlacklisted represents a UnBlacklisted event raised by the XCoin contract.
type XCoinUnBlacklisted struct {
	Account common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterUnBlacklisted is a free log retrieval operation binding the contract event 0x117e3210bb9aa7d9baff172026820255c6f6c30ba8999d1c2fd88e2848137c4e.
//
// Solidity: event UnBlacklisted(address indexed _account)
func (_XCoin *XCoinFilterer) FilterUnBlacklisted(opts *bind.FilterOpts, _account []common.Address) (*XCoinUnBlacklistedIterator, error) {

	var _accountRule []interface{}
	for _, _accountItem := range _account {
		_accountRule = append(_accountRule, _accountItem)
	}

	logs, sub, err := _XCoin.contract.FilterLogs(opts, "UnBlacklisted", _accountRule)
	if err != nil {
		return nil, err
	}
	return &XCoinUnBlacklistedIterator{contract: _XCoin.contract, event: "UnBlacklisted", logs: logs, sub: sub}, nil
}

// WatchUnBlacklisted is a free log subscription operation binding the contract event 0x117e3210bb9aa7d9baff172026820255c6f6c30ba8999d1c2fd88e2848137c4e.
//
// Solidity: event UnBlacklisted(address indexed _account)
func (_XCoin *XCoinFilterer) WatchUnBlacklisted(opts *bind.WatchOpts, sink chan<- *XCoinUnBlacklisted, _account []common.Address) (event.Subscription, error) {

	var _accountRule []interface{}
	for _, _accountItem := range _account {
		_accountRule = append(_accountRule, _accountItem)
	}

	logs, sub, err := _XCoin.contract.WatchLogs(opts, "UnBlacklisted", _accountRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(XCoinUnBlacklisted)
				if err := _XCoin.contract.UnpackLog(event, "UnBlacklisted", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseUnBlacklisted is a log parse operation binding the contract event 0x117e3210bb9aa7d9baff172026820255c6f6c30ba8999d1c2fd88e2848137c4e.
//
// Solidity: event UnBlacklisted(address indexed _account)
func (_XCoin *XCoinFilterer) ParseUnBlacklisted(log types.Log) (*XCoinUnBlacklisted, error) {
	event := new(XCoinUnBlacklisted)
	if err := _XCoin.contract.UnpackLog(event, "UnBlacklisted", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// XCoinUnpausedIterator is returned from FilterUnpaused and is used to iterate over the raw logs and unpacked data for Unpaused events raised by the XCoin contract.
type XCoinUnpausedIterator struct {
	Event *XCoinUnpaused // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *XCoinUnpausedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(XCoinUnpaused)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(XCoinUnpaused)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *XCoinUnpausedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *XCoinUnpausedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// XCoinUnpaused represents a Unpaused event raised by the XCoin contract.
type XCoinUnpaused struct {
	Account common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterUnpaused is a free log retrieval operation binding the contract event 0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa.
//
// Solidity: event Unpaused(address account)
func (_XCoin *XCoinFilterer) FilterUnpaused(opts *bind.FilterOpts) (*XCoinUnpausedIterator, error) {

	logs, sub, err := _XCoin.contract.FilterLogs(opts, "Unpaused")
	if err != nil {
		return nil, err
	}
	return &XCoinUnpausedIterator{contract: _XCoin.contract, event: "Unpaused", logs: logs, sub: sub}, nil
}

// WatchUnpaused is a free log subscription operation binding the contract event 0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa.
//
// Solidity: event Unpaused(address account)
func (_XCoin *XCoinFilterer) WatchUnpaused(opts *bind.WatchOpts, sink chan<- *XCoinUnpaused) (event.Subscription, error) {

	logs, sub, err := _XCoin.contract.WatchLogs(opts, "Unpaused")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(XCoinUnpaused)
				if err := _XCoin.contract.UnpackLog(event, "Unpaused", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseUnpaused is a log parse operation binding the contract event 0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa.
//
// Solidity: event Unpaused(address account)
func (_XCoin *XCoinFilterer) ParseUnpaused(log types.Log) (*XCoinUnpaused, error) {
	event := new(XCoinUnpaused)
	if err := _XCoin.contract.UnpackLog(event, "Unpaused", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
