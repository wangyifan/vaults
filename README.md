# XChain 合约


## 安装
```bash
npm install
```
---

## 合约 contract
合约代码在contracts目录下, 主要涉及的合约为：

1. vaultX.sol
2. vaultY.sol
3. xcoin.sol

---

## 编译 compile
```bash
make compile
```
编译结果在build/contracts中与合约对应的json文件中

---

## 测试 test
测试文件在test目录下
```bash
make ganache

make test
```