.PHONY: test compile size abigen migrationx

test:
	npx truffle test

ganache:
	npx ganache-cli --chainId 110

compile:
	npx truffle compile

migrationx:
	npx truffle migrate --network vaultxdev

size:
	npx truffle run contract-size

abigen: compile
	rm -rf abigenBindings
	mkdir abigenBindings
	npx truffle run abigen > "/tmp/abigen.out"
	abigen --abi abigenBindings/abi/VaultX.abi --pkg main --type VaultX --out abigenBindings/vaultx.go
	abigen --abi abigenBindings/abi/WTOKEN.abi --pkg main --type WToken --out abigenBindings/wtoken.go
	abigen --abi abigenBindings/abi/VaultY.abi --pkg main --type VaultY --out abigenBindings/vaulty.go
	abigen --abi abigenBindings/abi/XToken.abi --pkg main --type XToken --out abigenBindings/xtoken.go
	abigen --abi abigenBindings/abi/VssBase.abi --pkg main --type VssBase --out abigenBindings/vssbase.go
	@echo "Done generating go binding for xchain contracts [vaultx.go, wtoken.go, vaulty.go, xtoken.go, vssbase.go]"


