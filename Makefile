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
	abigen --abi abigenBindings/abi/XCoin.abi --pkg main --type XCoin --out abigenBindings/xcoin.go
	abigen --abi abigenBindings/abi/VaultX.abi --pkg main --type VaultX --out abigenBindings/vaultx.go
	abigen --abi abigenBindings/abi/WTOKEN.abi --pkg main --type WToken --out abigenBindings/wtoken.go
	abigen --abi abigenBindings/abi/VaultY.abi --pkg main --type VaultY --out abigenBindings/vaulty.go
	abigen --abi abigenBindings/abi/VssBase.abi --pkg main --type VssBase --out abigenBindings/vssbase.go
	abigen --abi abigenBindings/abi/XEvents.abi --pkg main --type XEvents --out abigenBindings/xevents.go
	abigen --abi abigenBindings/abi/XConfig.abi --pkg main --type XConfig --out abigenBindings/xconfig.go
	@echo "Done generating go binding for xchain contracts [vaultx.go, wtoken.go, vaulty.go, xcoin.go, vssbase.go, xevents.go, xconfig.go]"


