{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    pnpm = {
      enable = true;
      package = pkgs.pnpm_12;
      install.enable = true;
    };
  };

  tasks = {
    "pnpm:install" = {
      exec = "pnpm install";
    };
  };

  processes = {
    web = {
      exec = "pnpm dev";
      after = [ "pnpm:install" ];
    };
  };
}
