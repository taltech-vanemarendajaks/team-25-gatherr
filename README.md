# team-25-ajaplaneerija

# Setup

- Copy-paste `.env.example` into `.env` in the project root, fill in required values
```
cp .env.example .env
```

- Install frontend dependencies
```
cd frontend
npm install
```

# Running backend

```
docker compose up -d
```

For seeing backend logs: `docker compose logs -f backend`

# Running frontend

```
cd frontend
npm run dev
```