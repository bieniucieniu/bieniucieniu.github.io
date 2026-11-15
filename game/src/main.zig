//! Web entry point. The game is compiled as a static library and emcc links
//! it, so the C symbols JS needs are exported from here:
//!   main            starts the window and the browser-driven frame loop
//!   chicks_click    forwards a page click (see src/lib/chicks.ts in the site)
//!   chicks_kill     removes every chick
//!   chicks_respawn  brings a fresh flock
//! (`main` is not declared as a Zig `main`: std's start code would treat it as
//! the Zig entry point and expect the Zig signature.)

const engine = @import("engine.zig");
const Game = @import("game.zig").Game;

var game: Game = undefined;

fn cMain(argc: c_int, argv: [*c][*c]u8) callconv(.c) c_int {
    _ = argc;
    _ = argv;
    engine.run(Game, &game, .{ .title = "chicks" });
    return 0;
}

fn chicksClick(x: f32, y: f32, button: c_int) callconv(.c) void {
    game.click(x, y, button);
}

fn chicksKill() callconv(.c) void {
    game.kill();
}

fn chicksRespawn() callconv(.c) void {
    game.respawn();
}

comptime {
    @export(&cMain, .{ .name = "main" });
    @export(&chicksClick, .{ .name = "chicks_click" });
    @export(&chicksKill, .{ .name = "chicks_kill" });
    @export(&chicksRespawn, .{ .name = "chicks_respawn" });
}
