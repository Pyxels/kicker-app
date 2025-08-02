/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2971499502")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2971499502")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.id ?= team1.id || @request.auth.id ?= team2.id"
  }, collection)

  return app.save(collection)
})
