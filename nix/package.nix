{pkgs, ...}: let
  version = "0.0.3";
in {
  frontend-dist = pkgs.buildNpmPackage {
    inherit version;
    name = "kicker-frontend-dist";
    src = ../frontend;

    npmDepsHash = "sha256-xCuqq6dRcu8SImVN9LBzimocDmGGfq1EIIs/BQQw13U=";

    installPhase = ''
      runHook preInstall
      mkdir -p $out
      cp -r dist/ $out
      runHook postInstall
    '';
  };
  backend-data = pkgs.stdenv.mkDerivation {
    name = "kicker-pocketbase-data";
    src = ../backend;

    installPhase = ''
      runHook preInstall
      mkdir -p $out
      cp -r pb_migrations/ pb_hooks/ $out
      runHook postInstall
    '';
  };
  inherit (pkgs) pocketbase;
}
