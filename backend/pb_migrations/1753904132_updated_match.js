/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2971499502")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id ?= team_black.id || @request.auth.id ?= team_blue.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2971499502")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id ?= team_black || @request.auth.id ?= team_blue"
  }, collection)

  return app.save(collection)
})
