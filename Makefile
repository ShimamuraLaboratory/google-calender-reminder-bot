build_environment:
	@echo "🛠️  Building environment..."
	sh scripts/pnpm_install.sh
	pnpm i
	pnpx lefthook install
	@echo "✅  Environment built successfully."
