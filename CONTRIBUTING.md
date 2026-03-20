# Contributing to Gatherr

To maintain code quality and a smooth development workflow, please follow these guidelines.

<!--* [Code of Conduct](#coc)-->

- [Development Setup](#development)
- [Commit Message Guidelines](#commit)

## <a name="development"></a> Development Setup

### Running the backend with the dev profile

The `dev` profile disables Google token verification so you can get a JWT instantly without a real Google account.

1. Copy `.env.example` to `.env` in the `backend/` directory:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. The `.env` file already has `SPRING_PROFILES_ACTIVE=dev` — no changes needed for local development
3. Start the backend:
   ```bash
   cd backend && docker compose up -d
   ```

### Getting a token in Postman

1. Import `postman_collection.json` from the repo root into Postman
2. Call `POST /auth/google` with any body:
   ```json
   { "idToken": "dev" }
   ```
3. Copy the `token` value from the response
4. Set it as the `token` collection variable in Postman (Collections → Gatherr API → Variables)
5. All other requests will now automatically include `Authorization: Bearer <token>`

The JWT lasts 1 year. After it expires, repeat steps 2–4.

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
