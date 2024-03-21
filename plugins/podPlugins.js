const fs = require("fs");
const path = require("path");
const generateCode = require("@expo/config-plugins/build/utils/generateCode");
const configPlugins = require("expo/config-plugins");

const code = `    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings["ONLY_ACTIVE_ARCH"] = "NO"
      end
    end`;

module.exports = (expoConfig) => {
  return configPlugins.withDangerousMod(expoConfig, [
    "ios",
    async (config) => {
      const filePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      const contents = fs.readFileSync(filePath, "utf-8");

      const addCode = generateCode.mergeContents({
        tag: "withReactAppleIosSimulatorNotFoundFix",
        src: contents,
        newSrc: code,
        anchor: /\s*__apply_Xcode_12_5_M1_post_install_workaround\(installer\)/i,
        offset: 1,
        comment: "#",
      });

      if (!addCode.didMerge) {
        console.error("ERROR: Cannot add withReactAppleIosSimulatorNotFoundFix to the project's ios/Podfile because it's malformed.");
        return config;
      }

      fs.writeFileSync(filePath, addCode.contents);

      return config;
    },
  ]);
};
