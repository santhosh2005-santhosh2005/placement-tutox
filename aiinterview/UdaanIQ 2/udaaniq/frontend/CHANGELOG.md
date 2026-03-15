# Changelog

All notable changes to the UdaanIQ frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Fixed `findDOMNode` error in FloatingCamera component by implementing `nodeRef` pattern in react-draggable
- Updated FloatingCamera component to use modern React ref pattern for drag functionality
- Removed dependency on deprecated ReactDOM.findDOMNode API

### Changed
- Updated react-draggable to use nodeRef API to avoid findDOMNode errors in React 18/Next.js
- Improved FloatingCamera component stability and compatibility with concurrent rendering modes

## [0.1.0] - 2025-10-19
- Initial release
