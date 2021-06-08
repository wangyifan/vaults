
# 流程示例 moac  <-  bsc

## 0. 在xcoin中， 用户调用以下函数，允许vaultY销毁自己的资产
```bash
approve(...)
```
---

## 1. 在vaultY中，用户调用以下函数销毁bmoac
```bash
burn(...)
```
---

## 2. 在vaultX中，xchain调用以下函数解锁moac
```bash
withdraw(...)
```
！！！ 注意调试时，1. withdraw函数的nonce需要递增, 2. vaultx中需要有相应的资产额度足够解锁。