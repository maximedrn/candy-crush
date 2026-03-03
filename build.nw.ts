import { execSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";
import nwbuild, { type Options, type SupportedPlatform } from "nw-builder";

enum Platform {
  Linux = "linux",
  Windows = "win",
  MacOS = "osx",
}

const WinAppConfig: Options<SupportedPlatform>["app"] = {
  name: "Candy Crush",
  company: "Maxime Dréan",
  fileDescription: "Candy Crush NW.js App",
  fileVersion: "1.0.0",
  internalName: "candycrush",
  originalFilename: "candycrush.exe",
  productName: "Candy Crush",
  productVersion: "1.0.0",
  icon: "./assets/icon.ico",
};

const OsxAppConfig: Options<SupportedPlatform>["app"] = {
  name: "Candy Crush",
  LSApplicationCategoryType: "public.app-category.games",
  NSHumanReadableCopyright: "",
  CFBundleIdentifier: "com.maxime.candycrush",
  CFBundleName: "Candy Crush",
  CFBundleDisplayName: "Candy Crush",
  CFBundleVersion: "1.0.0",
  CFBundleShortVersionString: "1.0.0",
  icon: "./assets/icon.icns",
};

const LinuxAppConfig: Options<SupportedPlatform>["app"] = {
  name: "Candy Crush",
  genericName: "Candy Game",
  comment: "Candy Crush Game built with NW.js",
  icon: "./assets/icon.png",
  categories: ["Game"],
  terminal: false,
};

/**
 * Build the NW.js application for the specified platform and architecture.
 *
 * @param {Platform} platform - The target platform for the build.
 * @param {Options["arch"]} arch - The target architecture for the build.
 * @returns {Promise<void>} - Resolves when the build process is complete.
 * @throws {Error} - Throws an error if the build process fails.
 */
const build = async <P extends SupportedPlatform>(
  platform: P,
  arch: Options["arch"],
): Promise<void> => {
  try {
    execSync("bun run build", { stdio: "inherit" });
    cpSync("package.json", "dist/package.json");
    rmSync("cache", { recursive: true, force: true });

    const options: Options<P> = {
      srcDir: "dist",
      mode: "build",
      version: "stable",
      flavor: "normal",
      platform,
      arch,
      outDir: `release/${platform}-${arch}`,
      cacheDir: "cache",
      downloadUrl: "https://dl.nwjs.io",
      glob: false,
      logLevel: "info",
      app: getPlatformAppConfig(platform),
    };

    await nwbuild(options);
  } catch (error: unknown) {
    process.exit(1);
  }
};

/**
 * Get platform-specific app configuration for NW.js build.
 *
 * @param {Platform} platform - The target platform for the build.
 * @returns {Options["app"]} - The app configuration object for the specified
 * platform.
 *
 */
const getPlatformAppConfig = <P extends SupportedPlatform>(
  platform: P,
): Options<P>["app"] => {
  if (platform === Platform.Windows) return WinAppConfig as Options<P>["app"];
  if (platform === Platform.MacOS) return OsxAppConfig as Options<P>["app"];
  if (platform === Platform.Linux) return LinuxAppConfig as Options<P>["app"];
  throw new Error(`Unsupported platform: '${platform}'.`);
};

const platform: string = process.argv[2];
const architecture: string = process.argv[3];
if (!platform || !architecture) process.exit(1);

await build(platform as SupportedPlatform, architecture as Options["arch"]);
