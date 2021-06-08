# 流程示例 moac - > bsc

## 0. 在bsc上部署xcoin合约，并授权
xcoin合约是erc20合约，部署在bsc上，代表bmoac

在xcoin中，管理员调用以下函数授予vaultY合约增发权限
```bash
grantMinter(...)
```

---

## 1. 在vault合约中设置代币映射并启用

需要在vaultX和vaultY以相同配置都执行一遍
```bash
setupTokenMapping(...)

unpauseTokenMapping(...)
```

---

## 2. 在vaultX中，用户调用以下函数锁仓
```bash
depositNative(...)
```
！！！ 如果是ERC20资产，调用deposit函数前，需要首先授权：
```bash
approve(...)
```
---

## 3. 在vaultY中，调用以下函数增发bmoac
```bash
mint(...)
```
！！！ 调试时，注意mint函数调用的nonce参数需要递增
