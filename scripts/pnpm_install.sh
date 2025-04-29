#!/bin/bash

# pnpmがインストールされているか確認
if ! command -v pnpm > /dev/null;
then
    echo "🤦  pnpm could not be found, installing..."
    wget -qO- https://get.pnpm.io/install.sh | sh -
else
    echo "✅  pnpm is already installed."
fi
