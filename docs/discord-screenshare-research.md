# How Discord implements screen sharing

Research done with REA (Reverse Engineer Anything) against the locally installed Discord desktop
client on Windows, versions `app-1.0.9264` and `app-1.0.9265`. This guides the architecture of this project.

## What was observed in the shipped app

These facts come straight from the installed files.

### 1. The desktop shell only lists capture sources

`modules/discord_desktop_core-1/discord_desktop_core/core.asar` registers an IPC handler named
`DISCORD_DESKTOP_CAPTURER_GET_SOURCES`. It calls Electron's `desktopCapturer.getSources` with
`types` limited to `screen` and `window`, a caller-chosen `thumbnailSize` and
`fetchWindowIcons: true`. It returns `{ id, name, url, icon }` for each source, where `url` and
`icon` are data URLs of the thumbnail and app icon. The renderer reaches it through
`getDesktopCaptureSources(options)`.

This is the data behind Discord's own "pick a screen or window" picker with thumbnails.

### 2. Browser-standard capture is used for in-app screenshots

The same package calls `navigator.mediaDevices.getDisplayMedia` with:

```js
{
  video: { width: innerWidth * devicePixelRatio, height: innerHeight * devicePixelRatio },
  audio: false,
  monitorTypeSurfaces: 'exclude',
  preferCurrentTab: true,
  selfBrowserSurface: 'include',
  surfaceSwitching: 'exclude',
}
```

It plays the stream in a `<video>`, waits for `loadedmetadata`, grabs the frame and stops every
track. This is the browser path a web-only app has available.

### 3. Encoding and transport are native, not JavaScript

`modules/discord_voice-1/discord_voice/discord_voice.node` is a native addon. Its strings include
`setDesktopSource`, `setDesktopSourceWithOptions`, `setDesktopSourceStatusCallback`,
`goLiveCameraFrames`, `simulcast`, the codecs `AV1`, `H264`, `H265`, `VP8`, `VP9`, and
`soundshare` options for capturing application audio. The desktop app hands the chosen source to
this engine, which encodes and sends media to Discord's servers.

### 4. Per app audio is Windows application loopback

A second look at version `app-1.0.9265` focused on how Discord shares only one app's sound.

- `discord_voice/index.js` declares the features `soundshare`, `screen_soundshare` and, on
  Windows only, `soundshare_loopback`. It exposes `setOnSoundshare`, `setOnSoundshareEnded` and
  `setOnSoundshareFailed`. No process id is passed from JavaScript: the renderer hands the native
  engine the Electron source id, which for windows has the form `window:<window handle>:0`.
- `discord_voice.node` contains `GetWindowThreadProcessId`, so the engine turns the window handle
  into a process id itself. It holds `soundsharePid` and `soundshareLoopback` settings.
- Its strings name `discord_native_lib/src/media/soundshare/loopback_controller.cpp` and the
  messages `Failed to load mmdevapi for application loopback capture`, `Failed to get address
  of ActivateAudioInterfaceAsync`, `audioses is too old for application loopback capture` and
  `IAudioClient::GetService failed looking up IAudioCaptureClient`. The UTF-16 string
  `VAD\Process_Loopback` is the virtual device that Windows exposes for capturing one process
  tree. It loads `ActivateAudioInterfaceAsync` from `mmdevapi.dll` at run time, so older Windows
  versions fail gracefully.
- A second path, `SoundhookController`, works with `discord_hook` (`DiscordHook64.dll`) and the
  shared names `Global\Discord_Soundshare_`. That is the older approach of injecting into the
  game to read its audio, kept for systems without application loopback.
- Video for windows uses `Windows.Graphics.Capture` (`GraphicsCaptureItem`,
  `Direct3D11CaptureFramePool`) inside the native engine.
- The shell is Electron, installed and updated by Squirrel.Windows (`Update.exe`,
  `packages/RELEASES` and `.nupkg` files). REA's fuse reader shows `RunAsNode` and the Node CLI
  inspect arguments turned off, and ASAR integrity checks off.

REA's native decompilers were not configured on this machine, so the native findings come from
embedded strings and imports, not decompiled code.

### How Screenshare's desktop app follows it

The Windows app in `desktop/` uses the same building blocks: Electron with Squirrel, a picker fed
by `desktopCapturer`, and a small native addon that activates `VAD\Process_Loopback` with
`ActivateAudioInterfaceAsync` for the process behind the chosen window. Discord encodes and sends
media natively, while Screenshare turns the captured samples into a WebRTC audio track inside
the page. That keeps one transport for the browser and the desktop app.

## What this means for a browser-only app

These are design choices inferred from the evidence above, not things observed in Discord's code.

- **Capture:** browsers cannot enumerate windows like `desktopCapturer`. We use `getDisplayMedia`
  and let the browser show its own picker. Audio capture works for tabs on Chromium only.
- **Mobile:** mobile browsers do not support `getDisplayMedia`. Phones can **watch** streams but
  cannot **share** their screen. The interface must detect this and hide the share action.
- **Transport:** Discord's Go Live sends media to its own selective forwarding servers, not
  peer to peer. For a small number of viewers, WebRTC peer connections with Supabase Realtime as
  the signalling channel are enough. A media server can be added later if rooms grow.
- **Codecs:** browsers negotiate VP8, VP9, H264 and AV1 through WebRTC. We can prefer one with
  `RTCRtpTransceiver.setCodecPreferences`, mirroring Discord's multi-codec support.
- **Authentication:** users sign in with Discord through Supabase Auth's Discord OAuth provider.

## Limits of this research

- Discord's web client code is downloaded from discord.com at runtime and is not in the local
  install, so its signalling protocol was not analyzed here.
- The native voice engine was only inspected through its embedded strings, not decompiled.
