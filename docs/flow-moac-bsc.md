# 流程示例 moac - > bsc

## 0. 在bsc上部署xcoin合约，并授权
xcoin合约是erc20合约，部署在bsc上，代表bmoac

在xcoin中，管理员调用以下函数授予vaultY合约增发权限
```bash
grantMinter(...)
```

---

## 1. 在vault合约中设置代币映射

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
---

## 3. 在vaultY中，xchain调用以下函数增发bmoac
```bash
mint(...)
```

---

## 4. 在vaultY中，用户调用以下函数提款
```bash
cashout(...)
```





