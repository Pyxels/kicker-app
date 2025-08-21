/// <reference path="../pb_data/types.d.ts" />

routerAdd("POST", "/api/hooks/password/reset", (e) => {
  if (!e.auth) return e.unauthorizedError();

  const record = $app.findRecordById("users", e.auth.id);
  record.setPassword("kicker1337");
  $app.save(record);

  e.next();
});
