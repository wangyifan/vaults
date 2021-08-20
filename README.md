# XChain Vault Contracts


## Installation
```bash
npm install
```
---

## Contracts
Under the 'contracts' directory, mainly：

1. vaultX.sol : vault contract on the 'source' chain
2. vaultY.sol : vault contract on the 'mapped' chain
3. xcoin.sol : erc20 for mapped assets

---

## Compile

```bash
make compile
```
see result json files in build/contracts

---

## Test
Start the ganache blockchain first before running any tests
```bash
make ganache

make test
```