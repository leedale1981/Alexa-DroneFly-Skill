echo "Building image..."
npm run docker-build

echo "Tagging image..."
npm run docker-tag

echo "Logging into docker hub..."
npm run docker-login

echo "Pushing to docker hub..."
npm run docker-push
