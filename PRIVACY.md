# Privacy Policy

_Last updated: August 22, 2026._

Heeler is a native iOS console for [herdr](https://herdr.dev). It connects to
machines you control ("Hosts") over SSH. Heeler has no user accounts,
advertising, analytics, or tracking. Your SSH credentials, terminal output,
prompts, files, and live agent sessions do not pass through a service operated
by Heeler's developer.

Agent Notifications use the limited-purpose Push Relay described below.

## Data stored on your device and Hosts

- **SSH credentials.** The Device Key's private half is generated on your
  device, remains in the iOS Keychain, and never leaves the device. Host
  fingerprints are stored locally. A saved Host password is also stored in the
  Keychain.
- **Notification Keys.** A separate Notification Key is generated on your
  device for each Host. It is stored in the shared Keychain and mirrored in the
  app's shared container so Live Activities can be decrypted while the device
  is locked. The mirror is protected until first unlock and excluded from
  backups. Heeler copies the key over SSH to the corresponding Host so the
  herdr plugin can encrypt notifications. The Push Relay never receives this
  key.
- **Host list and settings.** Your Hosts and Heeler settings are stored locally.
  Each Host stores its own notification registration and delivery preferences.
- **Live agent activity.** Terminal output, prompts, and pane contents travel
  only over the direct SSH connection between your device and your Host. The
  limited notification data described below takes a separate route.

## Agent Notifications and the Push Relay

Agent Notifications can tell you when an agent is blocked or done while Heeler
is backgrounded or closed. In this independent fork, push delivery is disabled
until you enter a valid custom relay URL. Blank, malformed, and original Heeler
relay addresses do not send. Apple Push Notification service (APNs) requires
credentials authorized for this app's bundle ID; no relay or APNs credentials
are supplied by this fork.

The relay has no accounts, database, durable queue, retry queue, or message
history. A Host encrypts the notification details with its Notification Key,
then the relay signs and forwards the push request to APNs without receiving
the key needed to decrypt those details.

### Data processed by the Push Relay

For every notification request, the relay processes:

- the Apple push token needed to address your device;
- the encrypted notification envelope (ciphertext);
- the Host's source IP address;
- request timing, frequency, and size; and
- the APNs environment and limited delivery-routing values.

For a Live Activity update, APNs must also receive the following values in
cleartext so iOS can update or end the activity without launching Heeler:

- aggregate counts of agents that are working, blocked, or done;
- the update or end event, delivery priority, and event timestamp; and
- when present, stale and dismissal timestamps.

These values describe the activity update but do not identify an individual
agent. Project names, task titles, agent types and names, Host names, pane IDs,
and per-agent details remain inside the encrypted envelope. The relay and APNs
do not receive the Notification Key used to decrypt that envelope.

If a notification cannot be decrypted, Heeler shows a generic fallback instead
of displaying unverified content.

### Purpose, retention, and service providers

The included relay code uses this data to validate requests, limit abuse, and
deliver notifications to APNs. A custom operator controls its own deployment
and data handling.

The relay code does not write device tokens, notification bodies, ciphertext,
or request history to application-managed durable storage. Source IP addresses
and Apple push tokens are used in volatile, per-instance memory for one-minute
rate-limit windows. This memory is not a durable user record and is discarded
when the worker instance is recycled.

The included relay targets Cloudflare Workers if deployed; no such deployment
is configured for this fork. A custom relay operator and Apple APNs may process
network and delivery metadata under their own terms. Service providers
processing data on Heeler's behalf are required to protect it consistently with
this policy and applicable law. Heeler uses them only for infrastructure and
push delivery.

- [Cloudflare Privacy Policy](https://www.cloudflare.com/privacypolicy/)
- [Apple Privacy Policy](https://www.apple.com/legal/privacy/)

## Your choices and deletion

Agent Notifications and Live Activities are optional.

- You can decline or revoke notification and Live Activity permissions in iOS
  Settings.
- Removing a Host's Notification Registration deletes this device's token and
  Notification Key from that Host, then removes the local per-Host Notification
  Key record.
- Removing a Host from Heeler deletes its local Host record and any saved Host
  password.

Heeler has no developer-operated account or user-content database, so there is
normally no server-side profile or content for the developer to retrieve or
delete. For a privacy or deletion request, open a content-free issue in the
[project issue tracker](https://github.com/SiNiSon-99/Heeler/issues/new)
and ask for a private follow-up channel. Do not put credentials, tokens, Host
details, or other sensitive information in a public issue.

## Custom relay URL

The herdr plugin and Heeler accept an explicit custom push relay base URL. The
relay source is public so its behavior can be inspected. Existing Host
registrations and keys are retained when routing is disabled or invalid;
deliberate removal remains available in Settings.

A custom relay must use APNs credentials authorized for this app's bundle ID.
The inherited App Store and TestFlight builds belong to the original project,
not this fork.

## Contact

For questions about this policy, use the
[project issue tracker](https://github.com/SiNiSon-99/Heeler/issues) and do
not include sensitive information.
