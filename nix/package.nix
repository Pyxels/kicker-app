{pkgs, ...}: let
  version = "0.0.7";
in rec {
  frontend-dist = pkgs.buildNpmPackage rec {
    inherit version;
    name = "kicker-frontend-dist";
    src = ../frontend;

    npmDeps = pkgs.importNpmLock {npmRoot = "${src}";};
    inherit (pkgs.importNpmLock) npmConfigHook;

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
      mkdir -p $out
      cp -r pb_migrations/ pb_hooks/ $out
    '';
  };
  kicker-app = pkgs.writeShellApplication {
    name = "kicker-app";
    text = ''
      ${pkgs.lib.getExe pkgs.pocketbase} serve \
            --http=0.0.0.0:8090 \
            --migrationsDir=${backend-data}/pb_migrations \
            --hooksDir=${backend-data}/pb_hooks \
            --publicDir=${frontend-dist}/dist \
            --dir=/var/lib/kicker-app/pb_data \
            "$@"
    '';
  };

  default = kicker-app;
}
