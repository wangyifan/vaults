compile:
	npx truffle compile

abigen: compile
	rm -rf abigenBindings
	mkdir abigenBindings
	npx truffle run abigen > "/tmp/abigen.out"
	abigen --abi abigenBindings/abi/VaultX.abi --pkg main --type VaultX --out abigenBindings/vaultx.go
	abigen --abi abigenBindings/abi/WTOKEN.abi --pkg main --type WToken --out abigenBindings/wtoken.go
	abigen --abi abigenBindings/abi/VaultY.abi --pkg main --type VaultY --out abigenBindings/vaulty.go
	abigen --abi abigenBindings/abi/XToken.abi --pkg main --type XToken --out abigenBindings/xtoken.go
	@echo "Done generating go binding for xchain contracts [vaultx.go, wtoken.go, vaulty.go, xtoken.go]"

