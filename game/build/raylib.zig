//! Compiles raylib's C sources for the browser (PLATFORM_WEB, WebGL via GLES2).
//! Built directly instead of through raylib's own build.zig, which tends to lag
//! behind Zig releases.

const std = @import("std");
const Sysroot = @import("emscripten.zig").Sysroot;

/// Path to raylib's `src/` (headers live there too).
pub fn srcDir(b: *std.Build) std.Build.LazyPath {
    return b.dependency("raylib", .{}).path("src");
}

pub fn build(
    b: *std.Build,
    target: std.Build.ResolvedTarget,
    optimize: std.builtin.OptimizeMode,
    sysroot: Sysroot,
) *std.Build.Step.Compile {
    const dep = b.dependency("raylib", .{});
    const mod = b.createModule(.{ .target = target, .optimize = optimize, .link_libc = true });
    const lib = b.addLibrary(.{ .name = "raylib", .linkage = .static, .root_module = mod });
    lib.setLibCFile(sysroot.libc_file);

    mod.addIncludePath(dep.path("src"));
    mod.addIncludePath(dep.path("src/platforms"));
    mod.addIncludePath(dep.path("src/external/glfw/include"));
    sysroot.addTo(mod);
    mod.addCMacro("_GNU_SOURCE", "");
    mod.addCMacro("PLATFORM_WEB", "");
    mod.addCMacro("GRAPHICS_API_OPENGL_ES2", "");
    // No audio, fonts or image loading are used, but rcore references the
    // other modules, so they are compiled in; the linker drops what is unused.
    mod.addCSourceFiles(.{
        .root = dep.path("src"),
        .files = &.{ "rcore.c", "rshapes.c", "rtextures.c", "rtext.c", "rmodels.c", "raudio.c" },
        .flags = &.{"-std=gnu99"},
    });
    return lib;
}
