## Purpose
Provide a complete single-screen arcade pyramid game with recognizable Q*bert rules and repeatable progression.

## Requirements
### Requirement: Pyramid movement and colors
The game SHALL present 28 tiles in seven rows, four diagonal hops, lethal unprotected edges, and tile coloring on landing. Level one requires one hop, level two two hops, level three reverts completed tiles, and later levels combine two-hop and reverting rules. Four rounds SHALL advance a level.
#### Scenario: Valid landing
- **WHEN** the player lands on an unfinished tile
- **THEN** its color progresses and awards 25 points
#### Scenario: Round complete
- **WHEN** all tiles reach target color
- **THEN** a completion bonus and unused-disc bonus are awarded and the next round becomes available
### Requirement: Hazards and rescue
The game SHALL include descending red balls, an egg that becomes a pursuing snake, green freeze balls, tile-reverting green enemies and side-climbing enemies. Two single-use edge discs SHALL return the player to the summit and remove a pursuing snake for a bonus.
#### Scenario: Rescue disc
- **WHEN** the player hops outward from the marked edge with a disc
- **THEN** one disc is consumed and the player returns safely to the summit
#### Scenario: Collision
- **WHEN** a vulnerable player touches a hostile enemy or falls off an unprotected edge
- **THEN** one life is lost and enemies reset, retaining tile progress and score
### Requirement: Run lifecycle
The game SHALL offer start, pause, resume, game over, restart, persistent best score, three starting lives and an extra life every 8000 points.
#### Scenario: Paused run
- **WHEN** the player pauses or hides the tab
- **THEN** movement and enemy timers stop until explicit resume
#### Scenario: Last life lost
- **WHEN** the player's lives reach zero
- **THEN** game over displays the score and offers a fresh run

