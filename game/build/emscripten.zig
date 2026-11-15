//! Emscripten support: sysroot discovery and the final `emcc` link step.
//!
//! Zig compiles everything (game + raylib + box2d) to wasm32-emscripten static
//! libraries; emcc only does the last link, supplying the GLFW/WebGL glue that
//! raylib's PLATFORM_WEB expects. The output is an ES module whose default export
//! is the module factory, its .wasm, and TypeScript declarations. The site
//! imports the module as source (src/lib/chicks.ts), so Vite bundles it and
//! gives both files content-hashed names. The module finds its .wasm with
//! `new URL("<name>.wasm", import.meta.url)`, which Vite rewrites to the hashed
//! asset.

const std = @import("std");

pub const Sysroot = struct {
    /// Absolute path to emscripten's `cache/sysroot`.
    path: []const u8,
    /// Generated libc.txt so Zig code (and translate-c) sees emscripten's libc.
    libc_file: std.Build.LazyPath,

    pub fn include(self: Sysroot, b: *std.Build) std.Build.LazyPath {
        return .{ .cwd_relative = b.pathJoin(&.{ self.path, "include" }) };
    }

    pub fn addTo(self: Sysroot, mod: *std.Build.Module) void {
        mod.addSystemIncludePath(self.include(mod.owner));
    }
};

pub const Toolchain = struct {
    emcc: []const u8,
    sysroot: Sysroot,
};

/// emcc: `-Demcc` > `$EMCC` > `emcc` on PATH.
/// sysroot: `-Dem-sysroot` > `$EM_SYSROOT` > `$EM_CACHE/sysroot`.
/// The devenv shell (../devenv.nix) exports EMCC/EM_CACHE/EM_SYSROOT.
pub fn toolchain(b: *std.Build, emcc_opt: ?[]const u8, sysroot_opt: ?[]const u8) ?Toolchain {
    const env = &b.graph.environ_map;
    const emcc = emcc_opt orelse env.get("EMCC") orelse "emcc";
    const sysroot_path = sysroot_opt orelse env.get("EM_SYSROOT") orelse blk: {
        const cache = env.get("EM_CACHE") orelse return null;
        break :blk b.pathJoin(&.{ cache, "sysroot" });
    };

    const libc_txt = b.fmt(
        \\include_dir={0s}/include
        \\sys_include_dir={0s}/include
        \\crt_dir={0s}/lib/wasm32-emscripten
        \\msvc_lib_dir=
        \\kernel32_lib_dir=
        \\gcc_dir=
        \\darwin_sdk_dir=
        \\
    , .{sysroot_path});
    return .{
        .emcc = emcc,
        .sysroot = .{
            .path = sysroot_path,
            .libc_file = b.addWriteFiles().add("emscripten-libc.txt", libc_txt),
        },
    };
}

pub const LinkOptions = struct {
    /// Output basename: `<name>.mjs`, `<name>.wasm` and `<name>.d.mts`.
    name: []const u8,
    /// C symbols callable from JS, without the leading underscore.
    exports: []const []const u8,
    optimize: std.builtin.OptimizeMode,
    /// Static libs to link; the first one's root exports `main`.
    libs: []const *std.Build.Step.Compile,
    /// JS prepended inside the module (`--pre-js`), with the runtime in scope.
    pre_js: ?std.Build.LazyPath = null,
};

/// Returns the directory containing `<name>.mjs`, `<name>.wasm` and
/// `<name>.d.mts`.
pub fn link(b: *std.Build, tc: Toolchain, opts: LinkOptions) std.Build.LazyPath {
    const run = b.addSystemCommand(&.{tc.emcc});
    run.setName(b.fmt("emcc {s}", .{opts.name}));
    for (opts.libs) |lib| run.addArtifactArg(lib);

    var exported: []const u8 = "_main";
    for (opts.exports) |sym| exported = b.fmt("{s},_{s}", .{ exported, sym });

    run.addArgs(&.{
        "-sUSE_GLFW=3",
        "-sALLOW_MEMORY_GROWTH=1",
        "-sSTACK_SIZE=1mb",
        "-sGL_ENABLE_GET_PROC_ADDRESS=1",
        "-sEXIT_RUNTIME=0",
        "-sMODULARIZE=1",
        "-sEXPORT_ES6=1",
        "-sENVIRONMENT=web",
        b.fmt("-sEXPORTED_FUNCTIONS={s}", .{exported}),
        "-Wno-version-check", // nixpkgs binaryen is often one version ahead of what emcc expects
    });
    run.addArg(switch (opts.optimize) {
        .debug => "-O0",
        .safe => "-O2",
        .fast => "-O3",
        .small => "-Oz",
    });
    if (opts.optimize == .debug) run.addArgs(&.{ "-g", "-sASSERTIONS=1" });
    if (opts.pre_js) |file| {
        run.addArg("--pre-js");
        run.addFileArg(file);
    }
    // Path is relative to the -o directory. `.d.mts` so TypeScript pairs it
    // with the `.mjs` (a `.d.ts` would not be picked up).
    run.addArgs(&.{ "--emit-tsd", b.fmt("{s}.d.mts", .{opts.name}) });
    run.addArg("-o");
    const js = run.addOutputFileArg(b.fmt("{s}.mjs", .{opts.name}));
    // Only fail on a non-zero exit; emcc's stderr chatter (cache builds,
    // version notes) is captured instead of shown as a failure.
    run.expectExitCode(0);
    return js.dirname();
}
