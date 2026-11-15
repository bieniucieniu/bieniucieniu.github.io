{ pkgs, config, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    pnpm = {
      enable = true;
      package = pkgs.pnpm_12;
      # Runs `pnpm install` on shell entry when the lockfile changed (from the
      # current directory, so enter the shell at the project root).
      install.enable = true;
    };
  };

  # Zig + emscripten build the background game (game/) to wasm; Vite runs
  # `zig build` itself (plugins/zig-build.ts).
  packages = [
    pkgs.zig_0_17
    pkgs.emscripten
  ];

  # emscripten's cache in the Nix store is read-only, but emcc writes ports
  # (GLFW glue, libGL, ...) into it on first use. Copy it once to a writable dir.
  env.EM_CACHE = "${config.devenv.state}/em-cache";
  env.EM_SYSROOT = "${config.devenv.state}/em-cache/sysroot";
  env.EMCC = "${pkgs.emscripten}/bin/emcc";

  enterShell = ''
    if [ ! -d "$EM_CACHE" ]; then
      mkdir -p "$EM_CACHE"
      cp -r ${pkgs.emscripten}/share/emscripten/cache/. "$EM_CACHE/"
      chmod -R u+w "$EM_CACHE"
    fi
  '';

  processes = {
    web.exec = "pnpm dev";
  };
}
