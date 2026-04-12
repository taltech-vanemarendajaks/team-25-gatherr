#!/bin/bash

echo "🌱 Starting Gatherr Backend..."
./mvnw spring-boot:run &

echo "🔍 Waiting for API docs to be available..."
until curl -s http://127.0.0.1:8080/api/v1/v3/api-docs > /dev/null; do
  sleep 3
done

echo "📝 API is UP! Generating frontend/schema.json..."
./mvnw springdoc-openapi:generate -Dspringdoc.outputFileName=schema.json -Dspringdoc.outputDir=/frontend

if [ $? -eq 0 ]; then
    echo "✅ Success: frontend/schema.json has been updated"
else
    echo "❌ Error: Failed to generate schema.json"
fi

# Bring the background process to the foreground so the container stays alive
echo "🚀 Backend is ready for development"
wait