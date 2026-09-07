# Niche Jayega

Peer pickup for hostels. **API** is this Next.js app. **UI** is in `/frontend`.

```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

- API: http://localhost:3000
- App: http://localhost:5173 (proxies `/api` to the backend)

Demo accounts (password `test1234`): Rahul `9876543210`, Priya `9876543211`, Amit `9876543212`. Community code `BLOCKB2024`.
