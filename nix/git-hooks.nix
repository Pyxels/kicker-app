{
  pkgs,
  inputs,
  system,
  ...
}:
inputs.git-hooks.lib.${system}.run {
  src = ./.;
  hooks = {
    alejandra.enable = true;
    nil.enable = true;
    statix.enable = true;

    eslint = {
      enable = true;
      stages = ["pre-push"];
      settings = {
        binPath = "./frontend/node_modules/.bin/eslint -c frontend/eslint.config.js";
        extensions = "\\.(js|ts|vue)$";
      };
    };

    check-merge-conflicts.enable = true;
    commitizen.enable = true;
    no-commit-to-branch.enable = true;
    actionlint.enable = true;
    detect-private-keys.enable = true;
    editorconfig-checker.enable = true;
    check-added-large-files.enable = true;
    trim-trailing-whitespace.enable = true;

    check-todos = {
      enable = true;
      entry = "${pkgs.writeShellScript "check_todos.sh" ''
        ${pkgs.ripgrep}/bin/rg '\s*//\s+TODO' "$@" && exit 1 || exit 0
      ''}";
    };
    check-console-logs = {
      enable = true;
      entry = "${pkgs.writeShellScript "check_console-logs.sh" ''
        ${pkgs.ripgrep}/bin/rg 'console\.\w+\(' "$@" && exit 1 || exit 0
      ''}";
    };
  };
}
