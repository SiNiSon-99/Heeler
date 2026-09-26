import Foundation
import Observation

/// A relay is disabled until an explicit usable custom URL is supplied.
@MainActor
@Observable
final class NotificationRelaySettings {
    private static let defaultsKey = "notification-relay-url"

    /// The raw text the user typed, persisted verbatim so the field round-trips
    /// (including an in-progress typo the user is still editing).
    var rawValue: String {
        didSet {
            let trimmed = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
            if trimmed.isEmpty {
                defaults.removeObject(forKey: Self.defaultsKey)
            } else {
                defaults.set(trimmed, forKey: Self.defaultsKey)
            }
        }
    }

    @ObservationIgnored private nonisolated(unsafe) let defaults: UserDefaults

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let stored = defaults.string(forKey: Self.defaultsKey) ?? ""
        if NotificationRelayEndpoint.isOriginal(stored) {
            rawValue = ""
            defaults.removeObject(forKey: Self.defaultsKey)
        } else {
            rawValue = stored
        }
    }

    var route: NotificationRelayRoute {
        if rawValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return .disabled
        }
        guard let url = Self.validate(rawValue) else { return .invalid }
        return .custom(url)
    }

    var relayURL: URL? {
        route.usableURL
    }

    /// Whether the current text is non-empty but not a usable relay URL, so the
    /// settings screen can flag a typo instead of silently ignoring it.
    var hasInvalidEntry: Bool {
        route == .invalid
    }

    /// HTTP remains available for a relay running on the developer's machine,
    /// but the settings screen must warn before the Host sends a device token
    /// and notification metadata over a cleartext network connection.
    var hasInsecureHTTPEntry: Bool {
        relayURL?.scheme?.lowercased() == "http"
    }

    /// Parses a custom relay base URL: an absolute http(s) URL with a host and
    /// no query or fragment. A path prefix is allowed (the relay may be
    /// deployed under a subpath); the plugin appends `/push` to whatever base
    /// it is given, so a query or fragment would only be a mistake.
    static func validate(_ text: String) -> URL? {
        NotificationRelayEndpoint.validate(text)
    }
}
