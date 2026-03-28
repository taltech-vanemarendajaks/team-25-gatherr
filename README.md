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

### 3. Set up your own Google project & auth client

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2. Go to [Google Auth Clients](https://console.cloud.google.com/auth/clients) and create a new client.
3. Add:
    - Name
    - Authorized JavaScript origins: `http://localhost:3000`
    - Authorized redirect URIs: `http://localhost:8080/login/oauth2/code/google`
4. Copy the Client ID and Client Secret to your `.env` file.

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