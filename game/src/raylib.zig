//! Thin layer over raylib's C API.
//! `c` is the translate-c output of `c/raylib_c.h` (raylib.h + raymath.h +
//! rlgl.h). Call it directly; this file only adds what translate-c can't
//! express well.

pub const c = @import("raylib_c");

pub const Color = c.Color;
pub const Vector2 = c.Vector2;
pub const Vector3 = c.Vector3;
pub const Rectangle = c.Rectangle;

pub fn rgba(r: u8, g: u8, b: u8, a: u8) Color {
    return .{ .r = r, .g = g, .b = b, .a = a };
}

/// Opaque grey, `v` from 0 (black) to 255 (white).
pub fn grey(v: u8) Color {
    return rgba(v, v, v, 255);
}

// raylib's color macros use C compound literals, which translate-c skips.
pub const black = grey(0);
pub const white = grey(255);
