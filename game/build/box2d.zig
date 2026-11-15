//! Compiles Box2D v3 C sources directly: for the browser, and natively for
//! `zig build test`.

const std = @import("std");
const Sysroot = @import("emscripten.zig").Sysroot;

pub fn includeDir(b: *std.Build) std.Build.LazyPath {
    return b.dependency("box2d", .{}).path("include");
}

const sources = [_][]const u8{
    "aabb.c",              "arena_allocator.c",  "bitset.c",         "body.c",
    "broad_phase.c",       "constraint_graph.c", "contact_solver.c", "contact_solver_w4.c",
    "contact_solver_w8.c", "contact.c",          "core.c",           "distance_joint.c",
    "distance.c",          "dynamic_tree.c",     "geometry.c",       "hull.c",
    "id_pool.c",           "island.c",           "joint.c",          "manifold.c",
    "math_functions.c",    "motor_joint.c",      "mover_joint.c",    "mover.c",
    "parallel_for.c",      "physics_world.c",    "pogo_joint.c",     "prismatic_joint.c",
    "recording.c",         "replay.c",           "revolute_joint.c", "scheduler.c",
    "sensor.c",            "shape.c",            "simd.c",           "snapshot.c",
    "solver_set.c",        "solver.c",           "table.c",          "timer.c",
    "types.c",             "weld_joint.c",       "wheel_joint.c",
};

/// `sysroot` is required for the emscripten target and ignored otherwise.
pub fn build(
    b: *std.Build,
    target: std.Build.ResolvedTarget,
    optimize: std.builtin.OptimizeMode,
    sysroot: ?Sysroot,
) *std.Build.Step.Compile {
    const dep = b.dependency("box2d", .{});
    const mod = b.createModule(.{ .target = target, .optimize = optimize, .link_libc = true });
    const lib = b.addLibrary(.{ .name = "box2d", .linkage = .static, .root_module = mod });
    mod.addIncludePath(dep.path("include"));

    // gnu17, not c17: plain c17 hides clock_gettime used by timer.c.
    // fp-contract=off keeps the solver deterministic (matches upstream).
    const common = [_][]const u8{ "-std=gnu17", "-D_GNU_SOURCE", "-ffp-contract=off" };
    // On emscripten Box2D takes its SSE2 path; emscripten's <emmintrin.h>
    // implements it on WASM SIMD. emcc would turn `-msse2` into these defines,
    // but we compile with Zig's clang, so set them directly. simd128 itself is
    // enabled on the web target (build.zig).
    const web = common ++ [_][]const u8{ "-msimd128", "-D__SSE__=1", "-D__SSE2__=1" };

    const is_web = target.result.os.tag == .emscripten;
    if (is_web) {
        const s = sysroot orelse @panic("box2d: emscripten target needs a sysroot");
        lib.setLibCFile(s.libc_file);
        // emscripten's SSE-on-WASM-SIMD headers must win over Zig's x86-only ones.
        mod.addIncludePath(.{ .cwd_relative = b.pathJoin(&.{ s.path, "include", "compat" }) });
        s.addTo(mod);
    }

    mod.addCSourceFiles(.{
        .root = dep.path("src"),
        .files = &sources,
        .flags = if (is_web) &web else &common,
    });
    return lib;
}
