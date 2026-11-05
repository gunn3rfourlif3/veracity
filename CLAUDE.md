# Veracity — project notes and gotchas

Anti-catfishing app. Expo + React Native, prebuilt to a bare Android project.
Package `io.zaaka.veracity`. Read this before starting work.

---

## 1. Product rules that are not up for re-litigation

These were decided deliberately. If a change would break one, say so rather than
quietly doing it.

**Evidence, never verdicts.** The app never says "this is a catfish". It reports
what was found: this photo appears on N profiles, the account is N days old, the
message pattern matches known scripts. Evidence is defensible and avoids
defamation exposure from accusing a real, identifiable person of fraud.

**Never build filter removal or deepfake forensics.**
- A filter discards information. Any "unfiltered" image is a fabrication, and
  users would draw conclusions from artifacts the pipeline invented.
- Deepfake detectors do not generalise across generators; published accuracy is
  in-distribution and collapses in the wild.
- Most catfish use *stolen photos of real people*. That is a search problem, not
  a forensics problem.
- The honest version is a **detection**: say the photo looks heavily processed and
  that matching is therefore less reliable. Never repair it.

**Hash-only retention.** Process ephemerally; store a perceptual hash. Never store
the original image or a face embedding. This is the POPIA position, not just
hygiene: s26 restricts processing biometric information, and discarding images and
embeddings is what keeps the app outside it. Coarse face-geometry *ratios* are the
ceiling — never embeddings.

**Live verification is the strongest signal and must stay the primary action.** A
randomised, time-boxed gesture prompt beats every forensic model and works against
both stolen photos and deepfakes.

**The "nothing conclusive" screen is the most common result**, so it defines the
product. Rules: no green tick, no shield, no percentage. Never "Looks safe". Keep
the line "No red flags found — but that's not the same as verified" and the
"What this does not mean" block. Absence of evidence is not evidence of absence.

**Tone: a second opinion, not an investigation.** The "case file" metaphor was
tried and dropped — it framed the user as building a dossier on someone, heavier
than the moment warrants. Avoid clinical status words ("Inconclusive") in
headline positions.

**Fixtures must be labelled in the UI.** Any check backed by a stub carries a
visible note. Remove the label only when the provider behind that row is real.

---

## 2. Build gotchas (restricted-network container)

These bit us in order and cost eight failed builds. Most do **not** apply on a
normal dev machine with open network — they matter in CI or a sandbox.

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Plugin [id: 'org.gradle.toolchains.foojay-resolver-convention'] was not found` | Gradle Plugin Portal unreachable; the plugin only auto-downloads a JDK | Remove the `plugins {}` line from `node_modules/@react-native/gradle-plugin/settings.gradle.kts` and install a JDK yourself |
| `Received status code 429 from server: Too Many Requests` on `repo.maven.apache.org` | Maven Central rate-limits through the proxy, and **Gradle treats 429 as fatal** rather than trying the next repo | Put `https://maven-central.storage-download.googleapis.com/maven2` *ahead of* `mavenCentral()` |
| 429 persists after adding the mirror globally | A `~/.gradle/init.d` script does **not** reach included builds' `pluginManagement`, and `allprojects` applies too late for the root `buildscript` classpath | Add the mirror in **four** places: root `build.gradle` `buildscript`, root `allprojects`, and the `settings.gradle.kts` of *both* included builds (`@react-native/gradle-plugin`, `expo-modules-autolinking/android/expo-gradle-plugin`) |
| 429 inside `:gradle-plugin:shared` only | Included-build *subprojects* resolve their own deps | `dependencyResolutionManagement { repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS) }` in that included build's settings |
| `Cannot find a Java installation ... languageVersion=17` | Only JDK 21 installed; foojay would have fetched 17 | `apt-get install -y openjdk-17-jdk-headless`, then pass `-Porg.gradle.java.installations.paths=/usr/lib/jvm/java-17-openjdk-amd64,/usr/lib/jvm/java-21-openjdk-amd64` |
| `Gradle build daemon disappeared unexpectedly` | OOM-killed. 2 cores / 7 GB cannot host Gradle daemon + Kotlin daemon + workers | In `gradle.properties`: `org.gradle.parallel=false`, `org.gradle.workers.max=1`, `org.gradle.jvmargs=-Xmx1536m`, `kotlin.compiler.execution.strategy=in-process` |
| `ENOENT: ./assets/adaptive-icon.png` during prebuild | Current Expo template ships `android-icon-foreground/background/monochrome.png`, not `adaptive-icon.png` | Reference the real filenames in `app.json` |
| Manifest shows `android.intent.action.android.intent.action.SEND` | Expo **prefixes** intent-filter action/category names itself | Write `"action": "SEND"`, `"category": ["DEFAULT"]` — bare, not fully qualified |

### Build rules

- **`node_modules` patches do not survive `npm install`.** The foojay removal and
  the two mirror patches live there. Pin them with `patch-package` before relying
  on a repeatable build.
- **`expo prebuild` regenerates `android/` and will wipe hand edits** to
  `build.gradle`, `gradle.properties` and `AndroidManifest.xml`. Either re-apply
  after prebuild, or move the change into `app.json` / a config plugin. Prefer the
  config plugin.
- Always verify a build rather than trusting `BUILD SUCCESSFUL`: check the
  signature (`apksigner verify`), that `assets/index.android.bundle` is present
  (otherwise it needs a dev server and crashes standalone), and the merged
  manifest. The malformed SEND filter was caught this way, not by the compiler.
- Keep all four ABIs (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`). Dropping
  x86_64 breaks emulators.

### Signing

The checked-in `veracity-test.keystore` (`veracity` / `veracity-test`) is a
**throwaway for sideloading only**. The real Play upload key must be generated
once and backed up — lose it and that listing can never be updated. Play requires
an AAB (`./gradlew bundleRelease`), not an APK.

---

## 3. Known weaknesses in the current code

Do not describe these as working.

- `src/pipeline.ts` `digest()` is a **placeholder digest, not a perceptual hash**.
  Stable per image, but not filter-invariant and will not match a re-encoded or
  cropped copy. A real pHash needs raw pixel access (native module or server step).
- `looksHeavilyFiltered()` keys off JPEG compressibility. It exercises the UI
  state; it is not trustworthy. Real version inspects the luma histogram for
  clipping and tonal compression.
- Reverse image search, scam-script detection and cross-user reports are fixtures.
- The share-sheet intent filter is declared but **incoming images are not handled
  in JS yet** — the app does not read the shared image.
- Link intake and outcome logging are not built.
- Navigation is `useState` in `App.tsx`, not a router. Fine for three screens;
  replace before adding more.

---

## 4. Next steps, in value order

1. Real perceptual hashing (normalise → pHash → multiple hashes per image).
2. Reverse-image-search provider behind one swappable interface — their terms are
   the constraint, not the code.
3. Cross-user correlation corpus. This is the moat: a commodity API is buyable,
   a corpus of "this image was flagged by 40 users across 6 platforms" is not.
4. Handle the incoming share intent.
5. Conversation-pattern scam detection via an LLM API with a tight rubric — not a
   fine-tuned DeBERTa.

Deferred deliberately: deepfake forensics, EXIF (platforms strip it), scraping
dating sites (flat ToS violation and an unwinnable cat-and-mouse for one engineer).

---

## 5. Regenerating the test keystore

`android/app/*.keystore` is gitignored — a signing key does not belong in a repo,
even a throwaway one. The release build needs it, so recreate it once after cloning:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore veracity-test.keystore \
  -alias veracity -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass veracity-test -keypass veracity-test \
  -dname "CN=Veracity Test, OU=Dev, O=Zaaka, C=ZA"
```

The alias and passwords must match `android/app/build.gradle`'s `signingConfigs.release`.
Sideloading only — never for Play upload.

## 6. Building

```bash
npm install                  # runs patch-package via postinstall — do not skip
cd android
./gradlew assembleRelease    # APK at android/app/build/outputs/apk/release/
./gradlew bundleRelease      # AAB, for Play
```

Do not let Android Studio upgrade AGP or the Gradle wrapper — the pinned versions
are what work. Build from the command line.
