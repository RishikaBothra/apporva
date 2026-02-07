# Backend Server

## setup

1. Install dependencies:

```bash
npm install
```

2. Create and update the `.env` file:

```env
cp .env.example .env
```

3. Apply Pending Migrations (IF NEEDED):

```bashbash
npm run push
```

4. Start the dev server:

```bash
npm run dev
```

should be running on `http://localhost:3000`

if you want to change the port, update the `PORT` variable in the `.env` file.

## migrations
- Generate a new migration:
```bash
npm run generate
```

- Apply migrations:
```bash
npm run push
```


