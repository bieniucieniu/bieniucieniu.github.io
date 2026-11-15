// Prepended inside the emscripten module (--pre-js): runs before `main`, with
// the runtime (including the GLFW object) in scope. The postRun hook runs
// right after `main`, once raylib's InitWindow has set up GLFW.
//
// The game is a page background, not the page itself:
// - GLFW listens for keys on `window` in capture phase and calls
//   preventDefault() on Backspace and Tab, which would break typing and focus
//   navigation on the whole page. The game takes no keyboard input, so the
//   listeners are removed.
// - InitWindow sets document.title to the window title; put the page's back.
{
	const pageTitle = document.title;
	const hooks = Module["postRun"] ?? [];
	Module["postRun"] = [
		...(typeof hooks === "function" ? [hooks] : hooks),
		() => {
			window.removeEventListener("keydown", GLFW.onKeydown, true);
			window.removeEventListener("keypress", GLFW.onKeyPress, true);
			window.removeEventListener("keyup", GLFW.onKeyup, true);
			document.title = pageTitle;
		},
	];
}
