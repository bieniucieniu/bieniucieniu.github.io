//! Build graph for the background game. The C libraries live in `build/`:
//!   build/raylib.zig      raylib C build (web)
//!   build/box2d.zig       Box2D C build (web + native for tests)
//!   build/emscripten.zig  emscripten sysroot + emcc link
//!
//! Steps:
//!   zig build        zig-out/chicks.{mjs,wasm,d.mts}, imported by ../src/lib/chicks.ts
//!   zig build test   pure maths + Box2D wrapper tests (native)
//!
//! Needs emcc and its sysroot: run inside the devenv shell (../devenv.nix).

const std = @import("std");
const raylib = @import("build/raylib.zig");
const box2d = @import("build/box2d.zig");
const emscripten = @import("build/emscripten.zig");

pub fn build(b: *std.Build) void {
    const optimize = b.option(std.builtin.OptimizeMode, "optimize", "Optimize mode (default: small)") orelse .small;
    const emcc_opt = b.option([]const u8, "emcc", "Path to emcc (default: $EMCC or emcc on PATH)");
    const sysroot_opt = b.option([]const u8, "em-sysroot", "Emscripten sysroot (default: $EM_SYSROOT or $EM_CACHE/sysroot)");

    // ---- tests (native) ---------------------------------------------------
    const host = b.graph.host;
    const test_step = b.step("test", "Run maths and Box2D wrapper tests");
    const math_tests = b.addTest(.{ .root_module = b.createModule(.{
        .root_source_file = b.path("src/math.zig"),
        .target = host,
        .optimize = .debug,
    }) });
    test_step.dependOn(&b.addRunArtifact(math_tests).step);

    const box2d_tests_mod = b.createModule(.{
        .root_source_file = b.path("src/box2d.zig"),
        .target = host,
        .optimize = .debug,
        .imports = &.{.{ .name = "box2d_c", .module = translate(b, host, .debug, null, "src/c/box2d_c.h", box2d.includeDir(b)) }},
    });
    box2d_tests_mod.linkLibrary(box2d.build(b, host, .debug, null));
    test_step.dependOn(&b.addRunArtifact(b.addTest(.{ .root_module = box2d_tests_mod })).step);

    // ---- web --------------------------------------------------------------
    const install = b.getInstallStep();
    const tc = emscripten.toolchain(b, emcc_opt, sysroot_opt) orelse {
        install.dependOn(&b.addFail("emscripten not found: enter the dev shell (`devenv shell`) or pass -Dem-sysroot=... -Demcc=...").step);
        return;
    };
    const target = b.resolveTargetQuery(.{
        .cpu_arch = .wasm32,
        .os_tag = .emscripten,
        .cpu_features_add = std.Target.wasm.featureSet(&.{.simd128}),
    });
    const sysroot = tc.sysroot;

    const game_mod = b.createModule(.{
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "raylib_c", .module = translate(b, target, optimize, sysroot, "src/c/raylib_c.h", raylib.srcDir(b)) },
            .{ .name = "box2d_c", .module = translate(b, target, optimize, sysroot, "src/c/box2d_c.h", box2d.includeDir(b)) },
        },
    });
    const game = b.addLibrary(.{ .name = "chicks", .linkage = .static, .root_module = game_mod });
    game.bundle_compiler_rt = true;
    game.setLibCFile(sysroot.libc_file);

    const out = emscripten.link(b, tc, .{
        .name = "chicks",
        .exports = &.{"chicks_click"},
        .optimize = optimize,
        .pre_js = b.path("src/web/pre.js"),
        .libs = &.{ game, raylib.build(b, target, optimize, sysroot), box2d.build(b, target, optimize, sysroot) },
    });
    install.dependOn(&b.addInstallDirectory(.{
        .source_dir = out,
        .install_dir = .prefix,
        .install_subdir = "",
    }).step);
}

/// translate-c of a header under `src/c/`, as a module.
fn translate(
    b: *std.Build,
    target: std.Build.ResolvedTarget,
    optimize: std.builtin.OptimizeMode,
    sysroot: ?emscripten.Sysroot,
    header: []const u8,
    include: std.Build.LazyPath,
) *std.Build.Module {
    const tc = b.addTranslateC(.{ .root_source_file = b.path(header), .target = target, .optimize = optimize });
    tc.addIncludePath(include);
    if (sysroot) |s| tc.addSystemIncludePath(s.include(b));
    return tc.createModule();
}
