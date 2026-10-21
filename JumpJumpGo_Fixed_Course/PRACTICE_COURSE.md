# Fixed practice course

Open index.html with an internet connection for the existing GSAP menu dependency.

This version has ten stationary platforms of width 140, a fixed layout, five collectibles worth 10 points each, and a green finishing platform. Landing on the top platform completes the course; touching all earlier platforms is optional.

In game.js, PRACTICE_COURSE stores the level layout. x measures from the canvas left edge. heightAboveGround measures upward from the ground; y is computed by subtracting that height from the ground surface. collectible controls whether that platform has a collectible. PRACTICE_PLATFORM_WIDTH sets every platform width.

loadPracticeCourse creates fresh platform and collectible objects on startup and Retry. resetGame restores the player and course state. updatePlayer remembers previousY, and the landing check detects feet crossing a platform top instead of requiring the feet to stop inside its thin surface.

The small course remains in the daytime stage. Random falling and oscillating platforms are absent. Moving-platform carrying, attachment of collectibles to moving platforms, timing across refresh rates, terrain flicker, camera smoothing, and visual redesign are later steps.

Checks: JavaScript syntax and a Node logic simulation passed. The simulation visits all ten platforms, collects all five items, verifies the finish condition, and verifies a clean Retry rebuild. A browser gameplay check is still required.

Test on your PC: play the course; finish at the green top platform; select Retry; confirm the same layout, fresh collectibles, zero score, and restored jumps. We have not pushed this version to GitHub.
