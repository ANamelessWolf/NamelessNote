# App icon

`icon.png` is a **placeholder** (a simple padlock on indigo, generated
programmatically) so the launcher-icon pipeline works out of the box.

To use your own artwork:

1. Replace `icon.png` with your logo — **1024x1024 PNG**, square, no rounded
   corners (Android applies the mask/shape). For a clean adaptive icon,
   keep the important content within the centered ~66% "safe zone", since
   Android crops the foreground into circles/squircles/etc. depending on
   the launcher.
2. Regenerate the launcher icons:
   ```bash
   cd mobile
   dart run flutter_launcher_icons
   ```
3. Rebuild: `flutter build apk --release`.

Config lives in `pubspec.yaml` under the `flutter_launcher_icons:` key.
