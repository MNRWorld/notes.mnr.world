import fs from "fs/promises";
import path from "path";

const ICON_NAMES = [
  "alert-triangle",
  "archive",
  "arrow-left",
  "arrows-maximize", // for Expand
  "arrows-minimize", // for Minimize
  "bolt",
  "book",
  "robot", // for Bot
  "brain",
  "briefcase",
  "bulb", // for Lightbulb
  "calendar",
  "check",
  "checkbox", // for CheckSquare
  "chevron-down",
  "chevron-right",
  "chevron-up",
  "circle",
  "clock",
  "code",
  "copy",
  "database",
  "device-floppy",
  "dots-vertical",
  "download",
  "eye",
  "eye-off",
  "feather",
  "file",
  "file-plus",
  "file-text",
  "files",
  "flag",
  "school", // for GraduationCap
  "heart",
  "history",
  "home",
  "info-circle", // for Info
  "key",
  "layout-grid",
  "list",
  "list-check",
  "loader-2", // for Loader
  "loader", // Alternative loader
  "lock",
  "movie",
  "music",
  "notebook",
  "palette",
  "pencil",
  "pin",
  "plane",
  "plus",
  "refresh", // for RefreshCcw
  "rocket",
  "rotate", // for RotateCcw
  "search",
  "send",
  "settings",
  "share",
  "shield",
  "shield-check",
  "sparkles", // Multiple sparkles icon (sparkle doesn't exist)
  "star",
  "tag",
  "trash",
  "typography",
  "upload",
  "user",
  "wifi-off", // for WifiOff
  "x",
  // Additional modern icons that exist
  "camera",
  "message-circle",
  "maximize",
  "minimize",
];

// Alternative icons for ones that might not exist
const ICON_ALTERNATIVES = {
  lightbulb: ["bulb", "lamp"],
  expand: ["arrows-maximize", "arrows-expand", "maximize"],
  minimize: ["arrows-minimize", "arrows-collapse", "minimize"],
  graduationcap: ["school", "graduation-cap", "academic-cap"],
  loader2: ["loader-2", "loader", "refresh"],
  wifioff: ["wifi-off", "wifi-off-2", "signal-slash"],
  "refresh-ccw": ["refresh", "rotate-ccw", "rotate"],
  bot: ["robot", "bot", "android"],
  checksquare: ["checkbox", "check", "check-circle"],
  info: ["info-circle", "alert-circle", "info-square"],
};

const ICONS_DIR = path.join(process.cwd(), "src/assets/icons");

async function downloadIcon(name) {
  try {
    // Try the main icon first
    let response = await fetch(
      `https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons/${name}.svg`,
    );

    // If the icon doesn't exist, try common variations
    if (!response.ok) {
      console.log(`Icon ${name} not found, trying alternatives...`);

      // Try common naming variations
      const variations = [
        name.replace(/-/g, "_"), // Try underscore instead of dash
        name.replace(/_/g, "-"), // Try dash instead of underscore
        name + "-outline", // Try outline version
        name + "-filled", // Try filled version
      ];

      for (const variation of variations) {
        response = await fetch(
          `https://cdn.jsdelivr.net/npm/@tabler/icons@latest/icons/${variation}.svg`,
        );
        if (response.ok) {
          console.log(`Found alternative: ${variation}`);
          break;
        }
      }
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch icon ${name}: ${response.status} ${response.statusText}`,
      );
    }
    const svgContent = await response.text();
    const filePath = path.join(ICONS_DIR, `${name}.svg`);
    await fs.writeFile(filePath, svgContent, "utf-8");
    console.log(`✅ Downloaded ${name}.svg`);
    return true;
  } catch (error) {
    console.error(`❌ Error downloading ${name}:`, error.message);
    return false;
  }
}

async function downloadIconWithFallback(name) {
  const success = await downloadIcon(name);
  if (!success && ICON_ALTERNATIVES[name]) {
    console.log(
      `🔄 Trying alternative for ${name}: ${ICON_ALTERNATIVES[name]}`,
    );
    const alternativeSuccess = await downloadIcon(ICON_ALTERNATIVES[name]);
    if (alternativeSuccess) {
      // Copy the alternative icon to the original name
      const alternatePath = path.join(
        ICONS_DIR,
        `${ICON_ALTERNATIVES[name]}.svg`,
      );
      const targetPath = path.join(ICONS_DIR, `${name}.svg`);
      try {
        const content = await fs.readFile(alternatePath, "utf-8");
        await fs.writeFile(targetPath, content, "utf-8");
        console.log(
          `✅ Created ${name}.svg using ${ICON_ALTERNATIVES[name]} as fallback`,
        );
      } catch (err) {
        console.error(`❌ Failed to create fallback for ${name}:`, err.message);
      }
    }
  }
}

async function main() {
  try {
    await fs.access(ICONS_DIR);
  } catch (error) {
    await fs.mkdir(ICONS_DIR, { recursive: true });
    console.log(`📂 Created directory: ${ICONS_DIR}`);
  }

  console.log(`Downloading ${ICON_NAMES.length} icons...`);

  // Download icons sequentially to avoid overwhelming the server
  for (const iconName of ICON_NAMES) {
    await downloadIconWithFallback(iconName);
  }

  console.log("\n🎉 Icon download process complete!");

  // Verify all icons were downloaded
  const missingIcons = [];
  for (const iconName of ICON_NAMES) {
    const filePath = path.join(ICONS_DIR, `${iconName}.svg`);
    try {
      await fs.access(filePath);
    } catch {
      missingIcons.push(iconName);
    }
  }

  if (missingIcons.length > 0) {
    console.log(`\n⚠️  Missing icons: ${missingIcons.join(", ")}`);
  } else {
    console.log("\n✅ All icons downloaded successfully!");
  }
}

main();
