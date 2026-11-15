//! Browser game runtime: window + main loop, the low-res isometric view, and
//! flat-shaded 3D primitives drawn with rlgl.
//!
//! A game is a type with:
//!   pub fn init(self: *Game) void
//!   pub fn update(self: *Game, dt: f32) void
//!   pub fn draw(self: *Game) void
//! started with `engine.run(Game, &game, .{ ... })`.

const std = @import("std");
pub const rl = @import("raylib.zig");
pub const b2 = @import("box2d.zig");
pub const math = @import("math.zig");

const Vector3 = rl.Vector3;

pub const Config = struct {
    title: [:0]const u8,
};

extern fn emscripten_set_main_loop(func: *const fn () callconv(.c) void, fps: c_int, simulate_infinite_loop: bool) void;

/// Opens a resizable window that tracks the browser window (raylib sizes the
/// canvas to window.innerWidth/innerHeight) and hands the frame loop to the
/// browser (requestAnimationFrame). Never returns.
pub fn run(comptime Game: type, game: *Game, cfg: Config) void {
    const S = struct {
        var g: *Game = undefined;

        fn frame() callconv(.c) void {
            g.update(rl.c.GetFrameTime());
            rl.c.BeginDrawing();
            g.draw();
            rl.c.EndDrawing();
        }
    };
    S.g = game;

    rl.c.SetConfigFlags(rl.c.FLAG_VSYNC_HINT | rl.c.FLAG_WINDOW_RESIZABLE);
    rl.c.InitWindow(640, 360, cfg.title.ptr);
    game.init();
    emscripten_set_main_loop(S.frame, 0, true);
}

/// Box2D floor point (meters) at `height` above the ground, in 3D space.
/// The Box2D plane (x, y) lies on the 3D ground plane (x, z); 3D Y is up.
pub fn to3(p: b2.Vec2, height: f32) Vector3 {
    return .{ .x = p.x, .y = height, .z = p.y };
}

/// Pixel-art look for top-down Box2D worlds: an orthographic Camera3D renders
/// into a small render texture that is upscaled `pixel`× with point filtering.
/// The texture always covers the whole window (see math.Viewport), and world
/// scale stays fixed, so a bigger window shows more ground.
///
///   view.fit(w, h);                      // when the window size changes
///   view.begin(bg); ...draw 3D...; view.end();
///   view.present();                      // inside BeginDrawing
pub const LowResView = struct {
    rt: rl.c.RenderTexture2D,
    vp: math.Viewport,
    cam: rl.c.Camera3D,
    opts: Options,

    pub const Options = struct {
        /// Window pixels per frame pixel.
        pixel: i32 = 4,
        /// Meters per frame pixel.
        meters_per_pixel: f32 = 11.0 / 180.0,
        /// Camera tilt above the ground. The camera looks along -z (into the
        /// screen) with no yaw, so world x runs across the screen.
        pitch: f32 = 30 * std.math.rad_per_deg,
    };

    pub fn init(win_w: i32, win_h: i32, opts: Options) LowResView {
        var self: LowResView = .{ .rt = undefined, .vp = undefined, .cam = undefined, .opts = opts };
        self.load(win_w, win_h);
        return self;
    }

    fn load(self: *LowResView, win_w: i32, win_h: i32) void {
        self.vp = .cover(win_w, win_h, self.opts.pixel);
        self.rt = rl.c.LoadRenderTexture(self.vp.w, self.vp.h);
        rl.c.SetTextureFilter(self.rt.texture, rl.c.TEXTURE_FILTER_POINT);
        const d: f32 = 50; // any distance works in ortho; far enough to avoid clipping
        const pitch = self.opts.pitch;
        self.cam = .{
            .position = .{ .x = 0, .y = d * @sin(pitch), .z = d * @cos(pitch) },
            .target = .{ .x = 0, .y = 0, .z = 0 },
            .up = .{ .x = 0, .y = 1, .z = 0 },
            .fovy = @as(f32, @floatFromInt(self.vp.h)) * self.opts.meters_per_pixel,
            .projection = rl.c.CAMERA_ORTHOGRAPHIC,
        };
    }

    /// Resizes to a new window size. Returns true if the frame size changed.
    pub fn fit(self: *LowResView, win_w: i32, win_h: i32) bool {
        const next: math.Viewport = .cover(win_w, win_h, self.opts.pixel);
        if (next.w == self.vp.w and next.h == self.vp.h) return false;
        rl.c.UnloadRenderTexture(self.rt);
        self.load(win_w, win_h);
        return true;
    }

    /// Half extents (meters) of the ground the view shows.
    pub fn groundHalfExtents(self: LowResView) b2.Vec2 {
        const aspect = @as(f32, @floatFromInt(self.vp.w)) / @as(f32, @floatFromInt(self.vp.h));
        const h = math.groundHalfExtents(self.cam.fovy, aspect, self.opts.pitch);
        return b2.vec2(h.x, h.y);
    }

    pub fn begin(self: LowResView, bg: rl.Color) void {
        rl.c.BeginTextureMode(self.rt);
        rl.c.ClearBackground(bg);
        rl.c.BeginMode3D(self.cam);
    }

    pub fn end(_: LowResView) void {
        rl.c.EndMode3D();
        rl.c.EndTextureMode();
    }

    /// Draws the low-res frame onto the window. Call between BeginDrawing/EndDrawing.
    pub fn present(self: LowResView) void {
        const src: rl.Rectangle = .{
            .x = 0,
            .y = 0,
            .width = @floatFromInt(self.vp.w),
            // Render textures are stored upside down.
            .height = -@as(f32, @floatFromInt(self.vp.h)),
        };
        const d = self.vp.dest();
        const dest: rl.Rectangle = .{ .x = d[0], .y = d[1], .width = d[2], .height = d[3] };
        rl.c.DrawTexturePro(self.rt.texture, src, dest, .{ .x = 0, .y = 0 }, 0, rl.white);
    }

    /// Ground point (Box2D coordinates) under a window-space position, or null
    /// if the ray misses the ground.
    pub fn groundAt(self: LowResView, x: f32, y: f32) ?b2.Vec2 {
        const p = self.vp.toFrame(x, y);
        const ray = rl.c.GetScreenToWorldRayEx(.{ .x = p.x, .y = p.y }, self.cam, self.vp.w, self.vp.h);
        const hit = math.rayGround(
            .{ .x = ray.position.x, .y = ray.position.y, .z = ray.position.z },
            .{ .x = ray.direction.x, .y = ray.direction.y, .z = ray.direction.z },
        ) orelse return null;
        return b2.vec2(hit.x, hit.z);
    }
};

/// Direction light comes from, used by `drawBox3`. Up and toward the camera's
/// left, so the camera-facing sides get different shades.
const light_dir: Vector3 = blk: {
    const v = [3]f32{ -0.35, 1.0, 0.55 };
    const len = @sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    break :blk .{ .x = v[0] / len, .y = v[1] / len, .z = v[2] / len };
};

fn shade(color: rl.Color, n: Vector3) rl.Color {
    const d = @max(0, n.x * light_dir.x + n.y * light_dir.y + n.z * light_dir.z);
    const k = 0.7 + 0.35 * d;
    const f = struct {
        fn ch(v: u8, s: f32) u8 {
            return @intFromFloat(@min(255, @as(f32, @floatFromInt(v)) * s));
        }
    }.ch;
    return .{ .r = f(color.r, k), .g = f(color.g, k), .b = f(color.b, k), .a = color.a };
}

fn add3(a: Vector3, b: Vector3, s: f32) Vector3 {
    return .{ .x = a.x + b.x * s, .y = a.y + b.y * s, .z = a.z + b.z * s };
}

fn neg(v: Vector3) Vector3 {
    return .{ .x = -v.x, .y = -v.y, .z = -v.z };
}

/// Solid box with flat per-face lighting, turned by `yaw` around the vertical
/// axis. `yaw` is a Box2D angle: local +x (length `size.x`) points along
/// to3(cos yaw, sin yaw). `size` is full extents: x = length, y = height,
/// z = width. Call inside a 3D mode.
pub fn drawBox3(center: Vector3, size: Vector3, yaw: f32, color: rl.Color) void {
    const fx = @cos(yaw);
    const fz = @sin(yaw);
    // Local axes in 3D, scaled to half extents.
    const ax: Vector3 = .{ .x = fx * size.x / 2, .y = 0, .z = fz * size.x / 2 };
    const ay: Vector3 = .{ .x = 0, .y = size.y / 2, .z = 0 };
    const az: Vector3 = .{ .x = -fz * size.z / 2, .y = 0, .z = fx * size.z / 2 };

    // Each face: its outward normal, the axis to its center, and the two
    // in-plane axes.
    const Face = struct { n: Vector3, along: Vector3, u: Vector3, v: Vector3 };
    const faces = [_]Face{
        .{ .n = .{ .x = fx, .y = 0, .z = fz }, .along = ax, .u = ay, .v = az },
        .{ .n = .{ .x = -fx, .y = 0, .z = -fz }, .along = neg(ax), .u = ay, .v = az },
        .{ .n = .{ .x = 0, .y = 1, .z = 0 }, .along = ay, .u = ax, .v = az },
        .{ .n = .{ .x = 0, .y = -1, .z = 0 }, .along = neg(ay), .u = ax, .v = az },
        .{ .n = .{ .x = -fz, .y = 0, .z = fx }, .along = az, .u = ax, .v = ay },
        .{ .n = .{ .x = fz, .y = 0, .z = -fx }, .along = neg(az), .u = ax, .v = ay },
    };

    _ = rl.c.rlCheckRenderBatchLimit(36);
    rl.c.rlBegin(rl.c.RL_TRIANGLES);
    for (faces) |f| {
        const col = shade(color, f.n);
        rl.c.rlColor4ub(col.r, col.g, col.b, col.a);
        const mid = add3(center, f.along, 1);
        const p00 = add3(add3(mid, f.u, -1), f.v, -1);
        const p10 = add3(add3(mid, f.u, 1), f.v, -1);
        const p11 = add3(add3(mid, f.u, 1), f.v, 1);
        const p01 = add3(add3(mid, f.u, -1), f.v, 1);
        // raylib culls back faces (counter-clockwise = front) when the batch
        // is flushed, so every face must wind CCW seen from outside.
        // p00→p10→p11 turns from u to v, which is CCW iff (u × v)·n > 0.
        const cx = f.u.y * f.v.z - f.u.z * f.v.y;
        const cy = f.u.z * f.v.x - f.u.x * f.v.z;
        const cz = f.u.x * f.v.y - f.u.y * f.v.x;
        const ccw = cx * f.n.x + cy * f.n.y + cz * f.n.z > 0;
        const tris = if (ccw)
            [_]Vector3{ p00, p10, p11, p00, p11, p01 }
        else
            [_]Vector3{ p00, p11, p10, p00, p01, p11 };
        for (tris) |p| rl.c.rlVertex3f(p.x, p.y, p.z);
    }
    rl.c.rlEnd();
}

/// Flat square on the ground plane, `size` meters a side, turned by `yaw`.
/// Call inside a 3D mode.
pub fn drawTile3(center: Vector3, size: f32, yaw: f32, color: rl.Color) void {
    const h = size / 2;
    const u: Vector3 = .{ .x = @cos(yaw) * h, .y = 0, .z = @sin(yaw) * h };
    const v: Vector3 = .{ .x = -u.z, .y = 0, .z = u.x };
    const p00 = add3(add3(center, u, -1), v, -1);
    const p10 = add3(add3(center, u, 1), v, -1);
    const p11 = add3(add3(center, u, 1), v, 1);
    const p01 = add3(add3(center, u, -1), v, 1);
    _ = rl.c.rlCheckRenderBatchLimit(6);
    rl.c.rlBegin(rl.c.RL_TRIANGLES);
    rl.c.rlColor4ub(color.r, color.g, color.b, color.a);
    // u × v points down (-Y), so p00→p11→p10 is counter-clockwise from above.
    for ([_]Vector3{ p00, p11, p10, p00, p01, p11 }) |p| rl.c.rlVertex3f(p.x, p.y, p.z);
    rl.c.rlEnd();
}

/// Flat filled disc on the ground plane (e.g. a blob shadow). Call inside a 3D mode.
pub fn drawDisc3(center: Vector3, radius: f32, color: rl.Color) void {
    const segs = 12;
    _ = rl.c.rlCheckRenderBatchLimit(segs * 3);
    rl.c.rlBegin(rl.c.RL_TRIANGLES);
    rl.c.rlColor4ub(color.r, color.g, color.b, color.a);
    for (0..segs) |i| {
        const a0 = @as(f32, @floatFromInt(i)) / segs * std.math.tau;
        const a1 = @as(f32, @floatFromInt(i + 1)) / segs * std.math.tau;
        // Center → a1 → a0 is counter-clockwise seen from above (+Y).
        rl.c.rlVertex3f(center.x, center.y, center.z);
        rl.c.rlVertex3f(center.x + @cos(a1) * radius, center.y, center.z + @sin(a1) * radius);
        rl.c.rlVertex3f(center.x + @cos(a0) * radius, center.y, center.z + @sin(a0) * radius);
    }
    rl.c.rlEnd();
}
