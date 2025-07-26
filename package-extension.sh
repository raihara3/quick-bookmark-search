#!/bin/bash

# 拡張機能をzipファイルにパッケージ化
echo "Packaging Quick Bookmark Search extension..."

# バージョンをmanifest.jsonから取得
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)",/\1/')
FILENAME="quick-bookmark-search-v${VERSION}.zip"

# 不要なファイルを除外してzipを作成
zip -r "$FILENAME" . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x "package-lock.json" \
  -x "create-icons.js" \
  -x "package-extension.sh" \
  -x "*.DS_Store" \
  -x "*.zip"

echo "✅ Package created: $FILENAME"
echo "📦 Ready to upload to Chrome Web Store or GitHub Release!"