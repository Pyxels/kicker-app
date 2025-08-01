/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2971499502")

  // remove field
  collection.fields.removeById("json1000645714")

  // remove field
  collection.fields.removeById("json1285788868")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json2729309672",
    "maxSize": 0,
    "name": "rounds",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2971499502")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json1000645714",
    "maxSize": 0,
    "name": "round2",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json1285788868",
    "maxSize": 0,
    "name": "round3",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json2729309672",
    "maxSize": 0,
    "name": "round1",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
