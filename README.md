# Kicker-App

Game and statistics tracker for our kicker games.

## Concept

- A match is whole game consisting of 2-3 rounds and has 2 players per team.
- Each round lasts until one team reaches 5 goals, after which they switch side and position.
- "Untern Tisch" is 10:0 loss
- Goals are also tracked as events with team/color, role and player for statistics.

## Development

See [project board](https://github.com/users/Pyxels/projects/1) for current roadmap and milestones.

```bash
nix develop # fetch dependencies
(cd frontend && npm install) # only once during setup
just dev # starts backend and frontend in dev mode
```

### Frontend

[Vue.js](https://vuejs.org/guide/introduction.html) frontend using [vite](https://vite.dev/) and [tailwind](https://tailwindcss.com/).

### Backend

[Pocketbase](https://pocketbase.io/) backend for easy prototyping. Its a "Backend as a Service" in a single binary providing a realtime database with CRUD operations, authentication an admin UI dashboard and automigrations.

After starting `pocketbase --dev` go to [http://localhost:8090/\_/](http://localhost:8090/_/) see the models and data. Modifying the collections auto-creates migrations in `./backend/pb_migrations/`.
