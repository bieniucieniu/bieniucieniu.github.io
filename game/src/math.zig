//! Pure helpers with no raylib or Box2D dependency, so `zig build test` can run
//! them natively.

const std = @import("std");

pub const Vec2 = struct { x: f32, y: f32 };
pub const Vec3 = struct { x: f32, y: f32, z: f32 };

/// Fixed-timestep accumulator: physics runs at a constant rate no matter the
/// frame rate. `steps()` returns how many physics steps to run this frame.
pub const FixedStep = struct {
    dt: f32 = 1.0 / 60.0,
    max_steps: u32 = 4,
    acc: f32 = 0,

    pub fn steps(self: *FixedStep, frame_dt: f32) u32 {
        self.acc += frame_dt;
        var n: u32 = 0;
        while (self.acc >= self.dt and n < self.max_steps) : (n += 1) self.acc -= self.dt;
        // Spiral-of-death guard: drop leftover time we couldn't simulate.
        if (n == self.max_steps) self.acc = @min(self.acc, self.dt);
        return n;
    }
};

/// Low-res frame covering a window: each frame pixel is `pixel`×`pixel` window
/// pixels, drawn from the top-left corner. The size is rounded up, so the frame
/// covers the whole window and the right/bottom edge is cropped by less than
/// one frame pixel.
pub const Viewport = struct {
    w: i32,
    h: i32,
    pixel: i32,

    pub fn cover(win_w: i32, win_h: i32, pixel: i32) Viewport {
        return .{
            .w = @max(1, std.math.divCeil(i32, win_w, pixel) catch 1),
            .h = @max(1, std.math.divCeil(i32, win_h, pixel) catch 1),
            .pixel = pixel,
        };
    }

    /// Window-space rectangle the frame is drawn into: x, y, width, height.
    pub fn dest(self: Viewport) [4]f32 {
        return .{ 0, 0, @floatFromInt(self.w * self.pixel), @floatFromInt(self.h * self.pixel) };
    }

    /// Window position -> frame pixel position.
    pub fn toFrame(self: Viewport, x: f32, y: f32) Vec2 {
        const p: f32 = @floatFromInt(self.pixel);
        return .{ .x = x / p, .y = y / p };
    }
};

/// Half extents of the ground (meters) seen by an orthographic camera looking
/// at the origin, `fovy` meters tall, tilted `pitch` radians above the ground,
/// with no yaw: x across the screen, y into the screen. Depth is stretched by
/// 1/sin(pitch) because the ground is seen at a slant.
pub fn groundHalfExtents(fovy: f32, aspect: f32, pitch: f32) Vec2 {
    return .{ .x = fovy * aspect / 2, .y = fovy / (2 * @sin(pitch)) };
}

/// How many chicks a pen with these half extents gets: about one per 9 m²
/// (the original 14×9 m pen held 14), clamped to [lo, hi].
pub fn chickCount(half: Vec2, lo: usize, hi: usize) usize {
    const area = 4 * half.x * half.y;
    const n: usize = @intFromFloat(@max(0, @round(area / 9)));
    return std.math.clamp(n, lo, hi);
}

/// Where a ray hits the ground plane y = 0, or null if it is parallel to it
/// or points away from it.
pub fn rayGround(pos: Vec3, dir: Vec3) ?Vec3 {
    if (@abs(dir.y) < 1e-6) return null;
    const t = -pos.y / dir.y;
    if (t < 0) return null;
    return .{ .x = pos.x + dir.x * t, .y = 0, .z = pos.z + dir.z * t };
}

/// Spawn and death animation curves. Times are seconds since the animation
/// started; negative means it hasn't started yet (a per-chick delay).
pub const anim = struct {
    /// Egg grows in, then wobbles until it cracks at `egg_end`.
    pub const egg_in: f32 = 0.12;
    pub const egg_end: f32 = 0.6;
    /// The chick pops out of the egg between `egg_end` and `hatch_end`.
    pub const hatch_end: f32 = 0.85;
    /// A dying chick hops, spins and shrinks away over `death_time`.
    pub const death_time: f32 = 0.55;

    /// Overshoots past 1 and settles back: a "pop".
    pub fn easeOutBack(x: f32) f32 {
        const k: f32 = 1.70158;
        const u = std.math.clamp(x, 0, 1) - 1;
        return 1 + (k + 1) * u * u * u + k * u * u;
    }

    /// Egg size (0 = not shown).
    pub fn eggScale(t: f32) f32 {
        if (t < 0 or t >= egg_end) return 0;
        return easeOutBack(t / egg_in);
    }

    /// Egg wobble angle, growing until it cracks.
    pub fn eggWobble(t: f32) f32 {
        if (t < 0 or t >= egg_end) return 0;
        return @sin(t * 28) * 0.4 * (t / egg_end);
    }

    /// Chick size while hatching (0 = still in the egg, 1 = hatched).
    pub fn hatchScale(t: f32) f32 {
        if (t < egg_end) return 0;
        return easeOutBack((t - egg_end) / (hatch_end - egg_end));
    }

    pub const Death = struct { scale: f32, lift: f32, spin: f32 };

    /// Look of a dying chick: a short hop, then spinning while it shrinks.
    pub fn death(t: f32) Death {
        if (t <= 0) return .{ .scale = 1, .lift = 0, .spin = 0 };
        const x = std.math.clamp(t / death_time, 0, 1);
        return .{
            .scale = 1 - x * x,
            .lift = 0.35 * @sin(std.math.pi * @min(1, t / 0.3)),
            .spin = 30 * t * t,
        };
    }
};

test "FixedStep runs whole steps and keeps remainder" {
    var fs: FixedStep = .{ .dt = 0.01 };
    try std.testing.expectEqual(@as(u32, 0), fs.steps(0.005));
    try std.testing.expectEqual(@as(u32, 1), fs.steps(0.006));
    try std.testing.expectApproxEqAbs(@as(f32, 0.001), fs.acc, 1e-5);
}

test "FixedStep caps steps after a long frame" {
    var fs: FixedStep = .{ .dt = 0.01, .max_steps = 4 };
    try std.testing.expectEqual(@as(u32, 4), fs.steps(1.0));
    try std.testing.expect(fs.acc <= 0.01);
}

test "Viewport covers the window, rounding up" {
    const exact = Viewport.cover(1280, 720, 4);
    try std.testing.expectEqual(@as(i32, 320), exact.w);
    try std.testing.expectEqual(@as(i32, 180), exact.h);
    try std.testing.expectEqual([4]f32{ 0, 0, 1280, 720 }, exact.dest());

    const odd = Viewport.cover(1281, 723, 4);
    try std.testing.expectEqual(@as(i32, 321), odd.w);
    try std.testing.expectEqual(@as(i32, 181), odd.h);

    const tiny = Viewport.cover(0, 0, 4);
    try std.testing.expectEqual(@as(i32, 1), tiny.w);
    try std.testing.expectEqual(@as(i32, 1), tiny.h);

    const p = exact.toFrame(8, 6);
    try std.testing.expectApproxEqAbs(@as(f32, 2), p.x, 1e-6);
    try std.testing.expectApproxEqAbs(@as(f32, 1.5), p.y, 1e-6);
}

test "groundHalfExtents stretches depth by the tilt" {
    const h = groundHalfExtents(10, 2, std.math.pi / 6.0);
    try std.testing.expectApproxEqAbs(@as(f32, 10), h.x, 1e-5);
    try std.testing.expectApproxEqAbs(@as(f32, 10), h.y, 1e-4);
}

test "chickCount scales with area and clamps" {
    try std.testing.expectEqual(@as(usize, 14), chickCount(.{ .x = 7, .y = 4.5 }, 6, 48));
    try std.testing.expectEqual(@as(usize, 6), chickCount(.{ .x = 1, .y = 1 }, 6, 48));
    try std.testing.expectEqual(@as(usize, 48), chickCount(.{ .x = 100, .y = 100 }, 6, 48));
}

test "rayGround" {
    const hit = rayGround(.{ .x = 1, .y = 5, .z = 2 }, .{ .x = 0, .y = -1, .z = 0 }).?;
    try std.testing.expectApproxEqAbs(@as(f32, 1), hit.x, 1e-6);
    try std.testing.expectApproxEqAbs(@as(f32, 0), hit.y, 1e-6);
    try std.testing.expectApproxEqAbs(@as(f32, 2), hit.z, 1e-6);
    try std.testing.expect(rayGround(.{ .x = 0, .y = 5, .z = 0 }, .{ .x = 1, .y = 0, .z = 0 }) == null);
    try std.testing.expect(rayGround(.{ .x = 0, .y = 5, .z = 0 }, .{ .x = 0, .y = 1, .z = 0 }) == null);
}

test "anim: egg pops in, chick pops out after it" {
    const a = anim;
    try std.testing.expectEqual(@as(f32, 0), a.eggScale(-0.1));
    try std.testing.expectApproxEqAbs(@as(f32, 1), a.eggScale(a.egg_in), 1e-5);
    try std.testing.expectEqual(@as(f32, 0), a.eggScale(a.egg_end));
    try std.testing.expectEqual(@as(f32, 0), a.hatchScale(a.egg_end - 0.01));
    try std.testing.expect(a.hatchScale(a.egg_end + 0.15) > 1); // overshoot
    try std.testing.expectApproxEqAbs(@as(f32, 1), a.hatchScale(a.hatch_end), 1e-5);
    try std.testing.expectApproxEqAbs(@as(f32, 1), a.hatchScale(10), 1e-5);
}

test "anim: death shrinks to nothing" {
    const a = anim;
    try std.testing.expectEqual(@as(f32, 1), a.death(-1).scale);
    try std.testing.expect(a.death(0.15).lift > 0.2);
    try std.testing.expectApproxEqAbs(@as(f32, 0), a.death(a.death_time).scale, 1e-6);
}
