# team-25-ajaplaneerija

## Local setup

### 1. Copy-paste `.env.example` into `.env` in the project root, fill in required values
```
cp .env.example .env
```

### 2. Install frontend dependencies
```
cd frontend
npm install
```

## Running backend

```
docker compose up -d
```

For seeing backend logs: `docker compose logs -f backend`

## Running frontend

```
cd frontend
npm run dev
```