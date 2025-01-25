default:
  @just --list

# start backend and frontend in dev mode
dev:
  bash -c 'cd frontend && npm run dev' & \
  bash -c 'cd backend && pocketbase serve --dev' & \
  wait
