//! chicks: a pen of chicks seen from a low-res isometric camera, filling the
//! whole window. They wander at random and bump into each other. A click drops
//! a seed (a right click scatters a handful); every chick runs for the nearest
//! one and the first to touch it eats it, the rest retarget or go back to
//! wandering.
//!
//! Physics is a flat Box2D world with zero gravity. The floor (x, y) is drawn
//! on the 3D ground plane (x, z) by engine.LowResView. The pen is exactly the
//! ground the view shows, so the window edges are its walls.

const std = @import("std");
const engine = @import("engine.zig");
const rl = engine.rl;
const b2 = engine.b2;
const c = b2.c;
const to3 = engine.to3;

const min_chicks = 6;
const max_chicks = 48;
const max_seeds = 64;

const wall_t: f32 = 0.25; // wall half thickness

const chick_r: f32 = 0.3;
const seed_r: f32 = 0.08;

// Steering. Damping eats part of the target speed: steady state is
// v = steer_k / (steer_k + damping) * desired, so the desired speeds are set
// a bit above the speeds we want to see.
const chick_damping: f32 = 3;
const steer_k: f32 = 10;
const max_accel: f32 = 14;
const chase_speed: f32 = 3.4;
const wander_speed: f32 = 1.2;
const eat_time: f32 = 0.6;

const Chick = struct {
    body: b2.BodyId,
    heading: f32,
    wander_dir: b2.Vec2,
    wander_timer: f32,
    pause_timer: f32 = 0,
    eat_timer: f32 = 0,
    walk_phase: f32 = 0,
    wobble_phase: f32,
    tint: u8,
};

const Seed = struct {
    body: b2.BodyId = undefined,
    alive: bool = false,
};

/// What a Box2D body is, stored in its user data: kind in the high bits, slot
/// index in the low ones. Walls have no tag.
const Tag = struct {
    const Kind = enum(usize) { chick = 1, seed = 2 };
    const shift = 16;

    fn make(kind: Kind, index: usize) *anyopaque {
        return @ptrFromInt(@backingInt(kind) << shift | index);
    }

    fn of(body: b2.BodyId, kind: Kind) ?usize {
        const raw = @intFromPtr(b2.userData(body) orelse return null);
        if (raw >> shift != @backingInt(kind)) return null;
        return raw & ((1 << shift) - 1);
    }
};

// Greys only (r = g = b), kept dark so page text on top stays readable.
// engine.drawBox3 shades faces between 0.7× and ~1.05× of these.
const tile_a = rl.grey(8);
const tile_b = rl.grey(14);
const chick_grey: f32 = 118;
const head_lift = 10;
const beak = rl.grey(70);
const comb = rl.grey(140);
const eye = rl.black;
const seed_col = rl.grey(150);
const shadow = rl.rgba(0, 0, 0, 60);

pub const Game = struct {
    world: b2.World,
    view: engine.LowResView,
    step: engine.math.FixedStep = .{},
    /// Inner half extents of the pen, meters.
    pen: b2.Vec2,
    walls: [4]b2.BodyId = undefined,
    chicks: [max_chicks]Chick = undefined,
    n_chicks: usize = 0,
    seeds: [max_seeds]Seed = @splat(.{}),
    time: f32 = 0,
    rng: std.Random.DefaultPrng,

    pub fn init(self: *Game) void {
        const view: engine.LowResView = .init(rl.c.GetScreenWidth(), rl.c.GetScreenHeight(), .{});
        self.* = .{
            .world = b2.World.init(b2.vec2(0, 0)),
            .view = view,
            .pen = view.groundHalfExtents(),
            .rng = .init(0xc41c),
        };
        self.buildWalls();
        self.setChickCount();
    }

    fn rand(self: *Game) std.Random {
        return self.rng.random();
    }

    fn range(self: *Game, lo: f32, hi: f32) f32 {
        return lo + self.rand().float(f32) * (hi - lo);
    }

    fn randomDir(self: *Game) b2.Vec2 {
        const a = self.range(0, std.math.tau);
        return b2.vec2(@cos(a), @sin(a));
    }

    fn buildWalls(self: *Game) void {
        const w = self.world.id;
        const p = self.pen;
        const opts: b2.BodyOptions = .{ .kind = .static };
        self.walls = .{
            b2.addBox(w, b2.vec2(0, p.y + wall_t), b2.vec2(p.x + 2 * wall_t, wall_t), opts),
            b2.addBox(w, b2.vec2(0, -p.y - wall_t), b2.vec2(p.x + 2 * wall_t, wall_t), opts),
            b2.addBox(w, b2.vec2(p.x + wall_t, 0), b2.vec2(wall_t, p.y), opts),
            b2.addBox(w, b2.vec2(-p.x - wall_t, 0), b2.vec2(wall_t, p.y), opts),
        };
    }

    fn clampToPen(self: *const Game, p: b2.Vec2, margin: f32) b2.Vec2 {
        return b2.vec2(
            std.math.clamp(p.x, -self.pen.x + margin, self.pen.x - margin),
            std.math.clamp(p.y, -self.pen.y + margin, self.pen.y - margin),
        );
    }

    /// Follows a window resize: new pen and walls, bodies pulled back inside,
    /// chick count matched to the new area.
    fn resize(self: *Game) void {
        self.pen = self.view.groundHalfExtents();
        for (self.walls) |wall| c.b2DestroyBody(wall);
        self.buildWalls();
        for (self.chicks[0..self.n_chicks]) |ch| {
            b2.moveTo(ch.body, self.clampToPen(b2.pose(ch.body).pos, chick_r));
        }
        for (self.seeds) |s| {
            if (s.alive) b2.moveTo(s.body, self.clampToPen(b2.pose(s.body).pos, seed_r));
        }
        self.setChickCount();
    }

    fn setChickCount(self: *Game) void {
        const want = engine.math.chickCount(.{ .x = self.pen.x, .y = self.pen.y }, min_chicks, max_chicks);
        while (self.n_chicks > want) {
            self.n_chicks -= 1;
            c.b2DestroyBody(self.chicks[self.n_chicks].body);
        }
        while (self.n_chicks < want) self.addChick();
    }

    /// Adds a chick at a random spot that doesn't overlap the others.
    fn addChick(self: *Game) void {
        const i = self.n_chicks;
        const m = chick_r * 2;
        var pos = b2.vec2(0, 0);
        for (0..100) |_| {
            pos = b2.vec2(self.range(-self.pen.x + m, self.pen.x - m), self.range(-self.pen.y + m, self.pen.y - m));
            const free = for (self.chicks[0..i]) |other| {
                const q = b2.pose(other.body).pos;
                const dx = q.x - pos.x;
                const dy = q.y - pos.y;
                if (dx * dx + dy * dy < 0.8 * 0.8) break false;
            } else true;
            if (free) break;
        }
        self.chicks[i] = .{
            .body = b2.addCircle(self.world.id, pos, chick_r, .{
                .linear_damping = chick_damping,
                .lock_rotation = true,
                .restitution = 0.2,
                .friction = 0.2,
                .user_data = Tag.make(.chick, i),
            }),
            .heading = self.range(0, std.math.tau),
            .wander_dir = self.randomDir(),
            .wander_timer = self.range(0.2, 2),
            .wobble_phase = self.range(0, std.math.tau),
            .tint = @intFromFloat(chick_grey * self.range(0.85, 1.0)),
        };
        self.n_chicks += 1;
    }

    fn spawnSeed(self: *Game, pos: b2.Vec2) void {
        for (&self.seeds, 0..) |*s, i| {
            if (s.alive) continue;
            s.* = .{
                .body = b2.addCircle(self.world.id, self.clampToPen(pos, seed_r * 2), seed_r, .{
                    .density = 0.3,
                    .linear_damping = 6,
                    .angular_damping = 4,
                    .user_data = Tag.make(.seed, i),
                }),
                .alive = true,
            };
            return;
        }
    }

    /// A click anywhere on the page, in window coordinates. `button` is the
    /// DOM MouseEvent.button: 2 (right) scatters seeds, anything else drops one.
    pub fn click(self: *Game, x: f32, y: f32, button: i32) void {
        const p = self.view.groundAt(x, y) orelse return;
        if (button != 2) return self.spawnSeed(p);
        for (0..8) |_| {
            const d = self.randomDir();
            const r = self.range(0.2, 1.4);
            self.spawnSeed(b2.vec2(p.x + d.x * r, p.y + d.y * r));
        }
    }

    fn nearestSeed(self: *const Game, p: b2.Vec2) ?b2.Vec2 {
        var best: ?b2.Vec2 = null;
        var best_d: f32 = std.math.inf(f32);
        for (self.seeds) |s| {
            if (!s.alive) continue;
            const q = b2.pose(s.body).pos;
            const d = (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y);
            if (d < best_d) {
                best_d = d;
                best = q;
            }
        }
        return best;
    }

    /// Picks each chick's desired velocity and pushes it there with a force.
    fn steer(self: *Game, dt: f32) void {
        for (self.chicks[0..self.n_chicks]) |*ch| {
            const p = b2.pose(ch.body).pos;
            const v = c.b2Body_GetLinearVelocity(ch.body);
            var desired = b2.vec2(0, 0);

            if (ch.eat_timer > 0) {
                ch.eat_timer -= dt;
            } else if (self.nearestSeed(p)) |target| {
                const dx = target.x - p.x;
                const dy = target.y - p.y;
                const len = @max(1e-4, @sqrt(dx * dx + dy * dy));
                const fwd = b2.vec2(dx / len, dy / len);
                // Sideways wobble so the run isn't a laser-straight line; fades
                // out near the seed so they don't orbit it.
                const wob = @sin(self.time * 7 + ch.wobble_phase) * 0.35 * @min(1, len / 1.5);
                desired = b2.vec2(
                    (fwd.x - fwd.y * wob) * chase_speed,
                    (fwd.y + fwd.x * wob) * chase_speed,
                );
                ch.pause_timer = 0;
            } else {
                ch.wander_timer -= dt;
                if (ch.wander_timer <= 0) {
                    ch.wander_timer = self.range(0.5, 2);
                    ch.wander_dir = self.randomDir();
                    if (self.rand().float(f32) < 0.3) ch.pause_timer = self.range(0.4, 1.5);
                }
                // Turn away from walls.
                if (@abs(p.x) > self.pen.x - 1 and std.math.sign(ch.wander_dir.x) == std.math.sign(p.x)) ch.wander_dir.x = -ch.wander_dir.x;
                if (@abs(p.y) > self.pen.y - 1 and std.math.sign(ch.wander_dir.y) == std.math.sign(p.y)) ch.wander_dir.y = -ch.wander_dir.y;

                if (ch.pause_timer > 0) {
                    ch.pause_timer -= dt;
                } else {
                    desired = b2.vec2(ch.wander_dir.x * wander_speed, ch.wander_dir.y * wander_speed);
                }
            }

            const mass = c.b2Body_GetMass(ch.body);
            var ax = (desired.x - v.x) * steer_k;
            var ay = (desired.y - v.y) * steer_k;
            const a_len = @sqrt(ax * ax + ay * ay);
            if (a_len > max_accel) {
                ax *= max_accel / a_len;
                ay *= max_accel / a_len;
            }
            c.b2Body_ApplyForceToCenter(ch.body, b2.vec2(ax * mass, ay * mass), true);

            // Face where we're going (drawing only; the body never rotates).
            const speed = @sqrt(v.x * v.x + v.y * v.y);
            if (speed > 0.15) {
                const want = std.math.atan2(v.y, v.x);
                var diff = want - ch.heading;
                diff = std.math.atan2(@sin(diff), @cos(diff));
                ch.heading += diff * @min(1, 10 * dt);
            }
            ch.walk_phase += speed * dt * 9;
        }
    }

    /// First chick to touch a seed eats it.
    fn eat(self: *Game) void {
        const events = c.b2World_GetContactEvents(self.world.id);
        var dead: [max_seeds]bool = @splat(false);
        for (events.beginEvents[0..@intCast(events.beginCount)]) |e| {
            const a = c.b2Shape_GetBody(e.shapeIdA);
            const b = c.b2Shape_GetBody(e.shapeIdB);
            const ci = Tag.of(a, .chick) orelse Tag.of(b, .chick) orelse continue;
            const si = Tag.of(a, .seed) orelse Tag.of(b, .seed) orelse continue;
            if (dead[si]) continue; // someone else got it this step
            dead[si] = true;
            self.chicks[ci].eat_timer = eat_time;
        }
        for (&self.seeds, dead) |*s, d| {
            if (!d) continue;
            c.b2DestroyBody(s.body);
            s.alive = false;
        }
    }

    pub fn update(self: *Game, dt: f32) void {
        if (self.view.fit(rl.c.GetScreenWidth(), rl.c.GetScreenHeight())) self.resize();

        var n = self.step.steps(dt);
        while (n > 0) : (n -= 1) {
            self.time += self.step.dt;
            self.steer(self.step.dt);
            self.world.step(self.step.dt);
            self.eat();
        }
    }

    // ---- drawing ------------------------------------------------------------

    fn box(center: rl.Vector3, l: f32, h: f32, w: f32, yaw: f32, col: rl.Color) void {
        engine.drawBox3(center, .{ .x = l, .y = h, .z = w }, yaw, col);
    }

    /// Checker of 1 m tiles turned 45°, so they read as isometric diamonds,
    /// covering the pen.
    fn drawGround(self: *const Game) void {
        const s = std.math.sqrt1_2;
        const reach = (self.pen.x + self.pen.y) * s + 1;
        const n: i32 = @intFromFloat(@ceil(reach));
        var j: i32 = -n;
        while (j <= n) : (j += 1) {
            var i: i32 = -n;
            while (i <= n) : (i += 1) {
                const u: f32 = @floatFromInt(i);
                const v: f32 = @floatFromInt(j);
                const p = b2.vec2((u - v) * s, (u + v) * s);
                if (@abs(p.x) > self.pen.x + 1 or @abs(p.y) > self.pen.y + 1) continue;
                const col = if (@mod(i + j, 2) == 0) tile_a else tile_b;
                engine.drawTile3(to3(p, 0), 1, std.math.pi / 4.0, col);
            }
        }
    }

    fn drawChick(ch: Chick) void {
        const p = b2.pose(ch.body).pos;
        const h = ch.heading;
        const f = b2.vec2(@cos(h), @sin(h)); // forward
        const s = b2.vec2(-f.y, f.x); // side
        const at = struct {
            fn at(o: b2.Vec2, fw: b2.Vec2, sd: b2.Vec2, along: f32, side: f32, height: f32) rl.Vector3 {
                return to3(b2.vec2(o.x + fw.x * along + sd.x * side, o.y + fw.y * along + sd.y * side), height);
            }
        }.at;

        const bob = 0.05 * @abs(@sin(ch.walk_phase));
        const eating = ch.eat_timer > 0;
        // While eating the head dips to the ground a few times.
        const peck = if (eating) @abs(@sin((eat_time - ch.eat_timer) * 16)) else 0;
        const head_fwd: f32 = if (eating) 0.3 else 0.2;
        const head_h: f32 = if (eating) 0.22 + 0.15 * peck else 0.56 + bob;
        const body_col = rl.grey(ch.tint);
        const head_col = rl.grey(ch.tint + head_lift);

        engine.drawDisc3(to3(p, 0.005), chick_r * 0.95, shadow);
        // Legs.
        box(at(p, f, s, 0, 0.09, 0.07), 0.05, 0.14, 0.05, h, beak);
        box(at(p, f, s, 0, -0.09, 0.07), 0.05, 0.14, 0.05, h, beak);
        // Body and tail.
        box(at(p, f, s, 0, 0, 0.3 + bob), 0.46, 0.34, 0.4, h, body_col);
        box(at(p, f, s, -0.28, 0, 0.42 + bob), 0.12, 0.16, 0.2, h, body_col);
        // Head, beak, comb, eyes.
        box(at(p, f, s, head_fwd, 0, head_h), 0.28, 0.26, 0.26, h, head_col);
        box(at(p, f, s, head_fwd + 0.18, 0, head_h - 0.03), 0.12, 0.07, 0.1, h, beak);
        box(at(p, f, s, head_fwd - 0.02, 0, head_h + 0.16), 0.14, 0.07, 0.05, h, comb);
        box(at(p, f, s, head_fwd + 0.08, 0.13, head_h + 0.04), 0.06, 0.06, 0.02, h, eye);
        box(at(p, f, s, head_fwd + 0.08, -0.13, head_h + 0.04), 0.06, 0.06, 0.02, h, eye);
    }

    fn drawSeed(s: Seed) void {
        const ps = b2.pose(s.body);
        engine.drawDisc3(to3(ps.pos, 0.005), seed_r * 1.1, shadow);
        box(to3(ps.pos, seed_r), seed_r * 2, seed_r * 1.6, seed_r * 1.4, ps.angle, seed_col);
    }

    pub fn draw(self: *Game) void {
        self.view.begin(rl.black);
        self.drawGround();
        for (self.seeds) |s| if (s.alive) drawSeed(s);
        for (self.chicks[0..self.n_chicks]) |ch| drawChick(ch);
        self.view.end();

        rl.c.ClearBackground(rl.black);
        self.view.present();
    }
};
