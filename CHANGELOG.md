# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2025-10-05

### Added
- Translations section in README.md acknowledging contributors
- Translators section in InfoModal component
- Dutch (NL) translation support (Many thanks to Peter Smits)

### Changed
- Updated InfoModal features section with comprehensive feature list

## [1.2.1] - 2025-10-05

### Added
- CHANGELOG.md following Keep a Changelog conventions

## [1.2.0] - 2025-10-05

### Added
- LinguiJS integration for improved localization management
- Bezique variant support with game server API updates
- Enhanced language loading with catalog loaders and error handling for missing translations

## [1.1.1] - 2025-09-26

### Added
- Disconnect functionality for opponents with updated localization strings

## [1.1.0] - 2025-09-25

### Added
- Win threshold feature with adjustable settings and localization
- Dynamic language loading support

### Changed
- Refactored language management system

## [1.0.0] - 2025-09-23

### Added
- Progressive Web App (PWA) support with application icons and manifest
- Enhanced WebSocket connection management and nearby player search functionality

### Changed
- Updated WebSocket URL handling for network testing and improved reconnection logic
- Adjusted dealer indicator positioning and enhanced opponent name display styling
- Application name change

### Fixed
- Opponent bar display issues
- Removed connection test functionality

## [0.2.2] - 2025-09-12

### Added
- Dealer indicators and dealer status management in game state and UI components
- Enhanced game mechanics with brisk scoring and online player checks

## [0.2.1] - 2025-09-12

### Changed
- Refactored game state management to use score and opponentScore
- Updated import paths to use absolute imports and restructured type definitions
- Refactored score entry handling to use typed entries and streamlined brisk logic
- Refactored sound management to use centralized playSound function with sound types

## [0.2.0] - 2025-09-12

### Added
- Player location updates and improved player search functionality
- Game snapshot clearing on remote reset and improved local reset logic
- Guarded undo functionality with opponent score update notifications

## [0.1.1] - 2025-09-11

### Added
- Real-time multiplayer infrastructure
- Geolocation handling for iOS PWA with basic SSL support

### Changed
- Refactored BeziqueScoreKeeper and added modal components for improved UI and game functionality

## [0.1.0] - 2025-09-11

### Added
- React-based application architecture
- Basic score tracking functionality

### Changed
- Migrated from initial implementation to React version

## [0.0.1] - 2025-09-10

### Added
- Initial project setup and basic structure
