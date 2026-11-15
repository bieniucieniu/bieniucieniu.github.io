//! Thin layer over Box2D v3's C API.
//! `c` is the translate-c output of `c/box2d_c.h`. Everything is reachable
//! through it; the helpers below cover the body setup boilerplate.

const std = @import("std");
pub const c = @import("box2d_c");

pub const Vec2 = c.b2Vec2;
pub const WorldId = c.b2WorldId;
pub const BodyId = c.b2BodyId;

pub const BodyType = enum(c_uint) {
    static = c.b2_staticBody,
    kinematic = c.b2_kinematicBody,
    dynamic = c.b2_dynamicBody,
};

pub fn vec2(x: f32, y: f32) Vec2 {
    return .{ .x = x, .y = y };
}

pub const World = struct {
    id: WorldId,
    sub_steps: c_int = 4,

    pub fn init(gravity: Vec2) World {
        var def = c.b2DefaultWorldDef();
        def.gravity = gravity;
        return .{ .id = c.b2CreateWorld(&def) };
    }

    pub fn deinit(self: World) void {
        c.b2DestroyWorld(self.id);
    }

    pub fn step(self: World, dt: f32) void {
        c.b2World_Step(self.id, dt, self.sub_steps);
    }
};

pub const BodyOptions = struct {
    kind: BodyType = .dynamic,
    density: f32 = 1,
    friction: f32 = 0.6,
    restitution: f32 = 0,
    /// Velocity decay per second. With zero gravity there is no ground friction,
    /// so this is what stops top-down bodies from sliding forever.
    linear_damping: f32 = 0,
    angular_damping: f32 = 0,
    lock_rotation: bool = false,
    /// Stored on the body, read back with `userData`.
    user_data: ?*anyopaque = null,
};

fn createBody(world: WorldId, pos: Vec2, opts: BodyOptions) BodyId {
    var def = c.b2DefaultBodyDef();
    def.type = @backingInt(opts.kind);
    def.position = pos;
    def.linearDamping = opts.linear_damping;
    def.angularDamping = opts.angular_damping;
    def.motionLocks.angularZ = opts.lock_rotation;
    def.userData = opts.user_data;
    return c.b2CreateBody(world, &def);
}

fn shapeDef(opts: BodyOptions) c.b2ShapeDef {
    var def = c.b2DefaultShapeDef();
    def.density = opts.density;
    def.material.friction = opts.friction;
    def.material.restitution = opts.restitution;
    def.enableContactEvents = true;
    return def;
}

/// Creates a body with a single axis-aligned box shape. Sizes are half-extents
/// in meters.
pub fn addBox(world: WorldId, pos: Vec2, half: Vec2, opts: BodyOptions) BodyId {
    const body = createBody(world, pos, opts);
    const def = shapeDef(opts);
    const box = c.b2MakeBox(half.x, half.y);
    _ = c.b2CreatePolygonShape(body, &def, &box);
    return body;
}

/// Creates a body with a single circle shape centered on the body origin.
pub fn addCircle(world: WorldId, pos: Vec2, radius: f32, opts: BodyOptions) BodyId {
    const body = createBody(world, pos, opts);
    const def = shapeDef(opts);
    const circle: c.b2Circle = .{ .center = vec2(0, 0), .radius = radius };
    _ = c.b2CreateCircleShape(body, &def, &circle);
    return body;
}

pub fn userData(body: BodyId) ?*anyopaque {
    return c.b2Body_GetUserData(body);
}

pub const Pose = struct { pos: Vec2, angle: f32 };

pub fn pose(body: BodyId) Pose {
    const t = c.b2Body_GetTransform(body);
    return .{ .pos = t.p, .angle = c.b2Rot_GetAngle(t.q) };
}

/// Moves a body without changing its rotation.
pub fn moveTo(body: BodyId, pos: Vec2) void {
    c.b2Body_SetTransform(body, pos, c.b2Body_GetRotation(body));
}

test "damped circle stops in zero gravity" {
    const world = World.init(vec2(0, 0));
    defer world.deinit();
    const body = addCircle(world.id, vec2(0, 0), 0.3, .{ .linear_damping = 4, .lock_rotation = true });
    c.b2Body_SetLinearVelocity(body, vec2(5, 0));
    for (0..120) |_| world.step(1.0 / 60.0);
    const v = c.b2Body_GetLinearVelocity(body);
    try std.testing.expect(@abs(v.x) < 0.01);
    const p = pose(body);
    try std.testing.expect(p.pos.x > 0.5);
    try std.testing.expectApproxEqAbs(@as(f32, 0), p.pos.y, 1e-5);
}

test "static box wall stops a circle and reports the contact" {
    const world = World.init(vec2(0, 0));
    defer world.deinit();
    var tag: u8 = 0;
    _ = addBox(world.id, vec2(2, 0), vec2(0.25, 2), .{ .kind = .static });
    const ball = addCircle(world.id, vec2(0, 0), 0.3, .{ .user_data = &tag });
    c.b2Body_SetLinearVelocity(ball, vec2(6, 0));
    var touched = false;
    for (0..60) |_| {
        world.step(1.0 / 60.0);
        touched = touched or c.b2World_GetContactEvents(world.id).beginCount > 0;
    }
    try std.testing.expect(touched);
    try std.testing.expect(pose(ball).pos.x < 2 - 0.25 - 0.3 + 0.05);
    try std.testing.expectEqual(@as(?*anyopaque, &tag), userData(ball));
}

test "moveTo keeps rotation" {
    const world = World.init(vec2(0, 0));
    defer world.deinit();
    const body = addCircle(world.id, vec2(0, 0), 0.3, .{});
    c.b2Body_SetTransform(body, vec2(0, 0), c.b2MakeRot(1));
    moveTo(body, vec2(3, -1));
    const p = pose(body);
    try std.testing.expectApproxEqAbs(@as(f32, 3), p.pos.x, 1e-6);
    try std.testing.expectApproxEqAbs(@as(f32, -1), p.pos.y, 1e-6);
    // b2MakeRot uses a fast cos/sin approximation.
    try std.testing.expectApproxEqAbs(@as(f32, 1), p.angle, 1e-3);
}
