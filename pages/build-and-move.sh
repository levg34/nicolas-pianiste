npm run build
mv dist/index.html ../view/pages.html
rm -rf ../public/assets/
mv dist/assets/ ../public/assets/
