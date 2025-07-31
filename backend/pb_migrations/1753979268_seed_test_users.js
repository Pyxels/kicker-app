/// <reference path="../pb_data/types.d.ts" />
const users = [
  {
    id: "hk9lyjumt9bgur4",
    email: "alice@example.com",
    name: "Alice",
  },
  {
    id: "m9qpp75t102umft",
    email: "bob@example.com",
    name: "Bob",
  },
  {
    id: "x0cojwn43if2jix",
    email: "carol@example.com",
    name: "Carol",
  },
  {
    id: "d2i75vjz8yrtnu5",
    email: "dave@example.com",
    name: "Dave",
  },
];

migrate((app) => {
  const usersCollection = app.findCollectionByNameOrId("users");
  users.forEach((user) => {
    app.save(
      new Record(usersCollection, {
        ...user,
        verified: true,
        password: "kicker1337",
      }),
    );
  });
});
