{
  description = "Kicker App";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs: let
    system = "x86_64-linux";
    pkgs = import inputs.nixpkgs {inherit system;};
  in {
    devShells.${system}.default = pkgs.mkShell {
      packages = with pkgs; [
        pocketbase
        nodejs_24

        just
        sqlite
      ];
      inherit (inputs.self.checks.${system}.git-hooks) shellHook;
    };
    checks.${system}.git-hooks = import ./git-hooks.nix {inherit pkgs inputs system;};
  };
}
