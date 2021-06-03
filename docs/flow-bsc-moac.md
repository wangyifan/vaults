
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
---

## 3. 在vaultX中，用户调用以下函数提款
```bash
cashout(...)
```