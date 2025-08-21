/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3687943326")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number3320769076",
    "max": 3,
    "min": 1,
    "name": "round",
    "onlyInt": true,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3687943326")

  // remove field
  collection.fields.removeById("number3320769076")

  return app.save(collection)
})
