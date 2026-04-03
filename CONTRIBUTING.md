# Contributing to Gatherr

To maintain code quality and a smooth development workflow, please follow these guidelines.

<!--* [Code of Conduct](#coc)-->

- [Development Setup](#development)
- [Commit Message Guidelines](#commit)

## <a name="development"></a> Development Setup

### IDE Go through these steps

We use **IntelliJ IDEA**. After cloning, configure the JDK:

1. `File` → `Project Structure` → `SDK` → select **Java 21**
2. `Build` → `Rebuild Project`

#### 1. Running the backend with the dev profile

The `dev` profile disables Google token verification so you can get a JWT instantly without a real Google account.

1. Copy `.env.example` to `.env` in root:
   ```bash
   cp .env.example .env
   ```
2. Give the Maven wrapper execute permissions (only needed once after cloning):
   ```bash
   chmod +x backend/mvnw
   ```
3. Start the backend:
   ```bash
   docker compose up -d
   ```

### 2. Getting a token in Postman (Using the Dev Google Login Bypass)

1. Import `postman_collection.json` from the repo root into Postman
2. Create a `POST` request to `http://localhost:8080/api/v1/auth/google`.
3. Set the `Content-Type` header to `application/json`.
4. Provide any dummy data in the body:
```
{
    "idToken": "bypass",
}
```
5. Copy the `token` value from the response.
4. Set it as the `token` collection variable in Postman (Collections → Gatherr API → Variables)
5. All other requests will now automatically include `Authorization: Bearer <token>`

### OPTIONAL: Testing the real Google Login flow

If you are working on the frontend UI or need to test the actual Google authentication logic, you cannot use the bypass. You will need to set up your own Google credentials.

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2. Go to [Google Auth Clients](https://console.cloud.google.com/auth/clients) and create a new client.
3. Add the following details:
    - **Name:** Gatherr Local Dev (or similar)
    - **Authorized JavaScript origins:** `http://localhost:8080`
4. Copy the generated **Client ID** into your frontend `.env.local` file (`VITE_GOOGLE_CLIENT_ID`).
5. Copy the exact same **Client ID** into your backend `.env` file (`GOOGLE_CLIENT_ID`). *(Note: You do not need the Client Secret for this architecture).*
6. Remove `SPRING_PROFILES_ACTIVE=dev` from your `.env` file and restart the backend to re-enable real Google token verification.

## <a name="commit"></a> Commit Message Guidelines

### Commit Message Format

Each commit message consists of a **header**, a **body**. The header has a special
format that includes a **type** and a **subject**:

```text
<type>: <subject>
<BLANK LINE>
<body> (if any)
```

The **header** is mandatory.

Any line of the commit message cannot be longer than 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

Footer should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if any.

#### Examples

```text
feat: add social login support for Google
```

```text
fix: resolve timeout issue on large data exports

Increase the default timeout threshold to 60 seconds for the export
endpoint to handle large datasets.
```

```text
docs: update installation steps for Windows users in README
```

```text
perf: implement lazy loading for the image gallery
```

```text
style: fix indentation and remove trailing whitespace in main.css
```

### Type

Must be one of the following:

- **chore**: Changes to the build process, libraries, package updates
- **ci**: Changes to our CI configuration files and scripts
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **test**: Adding missing tests or correcting existing tests
