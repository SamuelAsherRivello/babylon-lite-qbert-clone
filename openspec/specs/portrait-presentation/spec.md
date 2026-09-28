## Purpose
Make the arcade game readable and controllable in a fixed portrait frame on desktop and touch browsers.

## Requirements
### Requirement: Metallic WebGPU presentation
The game SHALL render the board and actors using WebGPU, reflective metal materials, a fixed isometric camera, and original border and gutter artwork.
#### Scenario: Compatible browser
- **WHEN** a WebGPU adapter is available
- **THEN** a visible animated metallic board renders without scrolling
#### Scenario: Unavailable GPU
- **WHEN** WebGPU initialization fails
- **THEN** a readable compatibility message and retry action replace the loading state
### Requirement: Equivalent input
WASD, arrow keys and four labeled touch buttons SHALL generate the same diagonal movements. Controls SHALL remain visible in portrait and desktop layouts, with focus styles and accessible names.
#### Scenario: Touch play
- **WHEN** the player presses a virtual direction
- **THEN** the character performs the corresponding keyboard-equivalent hop
### Requirement: Frame and settings
The UI SHALL preserve corner roles for title, links, settings and version, and provide sound, fullscreen, instructions, score, lives, level, round and tile progress.
#### Scenario: Small viewport
- **WHEN** the viewport is 390 by 844 or a short landscape screen
- **THEN** the entire board and controls fit without document scrolling

