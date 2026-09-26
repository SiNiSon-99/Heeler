import Foundation

/// A missing or rejected destination never arms push.
enum NotificationRelayRoute: Equatable, Sendable {
    case disabled
    case invalid
    case custom(URL)

    var usableURL: URL? {
        guard case .custom(let url) = self else { return nil }
        return NotificationRelayEndpoint.validate(url.absoluteString)
    }
}

enum NotificationRelayEndpoint {
    static let originalBaseURLStrings = [
        "https://heeler-apns.bybee.dev",
        "https://herdr-push-relay.69709991236.workers.dev",
        "https://herdr-apns.bybee.dev"
    ]

    static func isOriginal(_ value: String) -> Bool {
        guard let host = URLComponents(string: value.trimmingCharacters(in: .whitespacesAndNewlines))?
            .host?.lowercased() else { return false }
        return originalBaseURLStrings.contains {
            URLComponents(string: $0)?.host?.lowercased() == host
        }
    }

    static func validate(_ text: String) -> URL? {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty,
            let components = URLComponents(string: trimmed),
            let scheme = components.scheme?.lowercased(),
            scheme == "http" || scheme == "https",
            let host = components.host, !host.isEmpty,
            components.user == nil, components.password == nil,
            components.query == nil, components.fragment == nil,
            !isOriginal(trimmed), let url = components.url
        else { return nil }
        return url
    }
}
