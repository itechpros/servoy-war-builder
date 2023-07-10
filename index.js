/* Main application logic */

const core = require("@actions/core");
const childProcess = require("child_process");

try {
    // Check to make sure the requested Servoy version exists in our GitHub Container Registry
    const servoyVersion = core.getInput("servoy-version");
    verifyServoyImage(servoyVersion);

    // Build our command before we pull down the Docker image, so the user doesn't have to wait until the download completes
    // before they know something trivial is wrong.
    let commandArguments = buildDockerRunCommand();
    
    // Pull down the Docker image
    downloadServoyImage(servoyVersion);

    // Our command is now ready. Let 'er rip.
    const dockerRunProcess = childProcess.spawnSync(
        "docker", commandArguments,
        { stdio: "inherit" }
    );
    if (dockerRunProcess.status !== 0) {
        core.setFailed("WAR build failed. Please check the logs for more details.");
        process.exit();
    }
} catch (e) {
    core.setFailed(e.message);
}

function buildDockerRunCommand() {
    // Required properties
    const servoyVersion = core.getInput("servoy-version"),
          apiKey = core.getInput("api-key"),
          solutionName = core.getInput("solution-name"),
          defaultAdminUser = core.getInput("default-admin-user"),
          defaultAdminPassword = core.getInput("default-admin-password");

    let commandArguments = [
        "run", "--rm",
        "-v", `${process.env.GITHUB_WORKSPACE}:/servoy_code`,
        `ghcr.io/itechpros/servoy_builder:${servoyVersion}`,
        "-k", apiKey,
        "-s", solutionName,
        "-o", "/servoy_code",
        "-data", "/servoy_code",
        "-defaultAdminUser", defaultAdminUser,
        "-defaultAdminPassword", defaultAdminPassword
    ];

    let stringFields = {
        "properties-file": "-p",
        "properties-file-war": "-pfw",
        "beans": "-b",
        "exclude-beans": "-excludeBeans",
        "lafs": "-l",
        "exclude-lafs": "-excludeLafs",
        "drivers": "-d",
        "exclude-drivers": "-excludeDrivers",
        "plugins": "-pi",
        "exclude-plugins": "-excludePlugins",
        "components": "-crefs",
        "exclude-components": "-excludeComponentPkgs",
        "services": "-srefs",
        "exclude-services": "-excludeServicePkgs",
        "sample-data-row-count": "-sdcount",
        "allow-data-model-changes": "-allowDataModelChanges",
        "import-user-policy": "-importUserPolicy",
        "context-file-name": "-contextFileName",
        "log4j-configuration-file": "-log4jConfigurationFile",
        "web-xml-file-name": "-webXmlFileName",
        "ng2": "-ng2",
        "war-file-name": "-warFileName",
        "additional-solutions": "-nas"
    },
    multiValueStringFields = [
        "beans",
        "exclude-beans",
        "lafs",
        "exclude-lafs",
        "drivers",
        "exclude-drivers",
        "plugins",
        "exclude-plugins",
        "components",
        "exclude-components",
        "services",
        "exclude-services"
    ],
    booleanFields = {
        "ignore-build-errors": "-ie",
        "skip-build": "-sb",
        "dbi": "-dbi",
        "export-metadata": "-md",
        "check-metadata": "-checkmd",
        "sample-data": "-sd",
        "i18n": "-i18n",
        "users": "-users",
        "tables": "-tables",
        "overwrite-groups": "-overwriteGroups",
        "allow-sql-keywords": "-allowSQLKeywords",
        "stop-on-data-model-changes": "-stopOnDataModelChanges",
        "skip-database-views-update": "-skipDatabaseViewsUpdate",
        "override-sequence-types": "-overrideSequenceTypes",
        "override-default-values": "-overrideDefaultValues",
        "insert-new-i18n-keys-only": "-insertNewI18NKeysOnly",
        "add-users-to-admin-group": "-addUsersToAdminGroup",
        "update-sequences": "-updateSequences",
        "upgrade-repository": "-upgradeRepository",
        "use-as-real-admin-user": "-useAsRealAdminUser",
        "do-not-overwrite-db-server-properties": "-doNotOverwriteDBServerProperties",
        "overwrite-all-properties": "-overwriteAllProperties",
        "ng1": "-ng1"
    };
    Object.keys(stringFields).forEach((stringField) => {
        let stringFieldValue = core.getInput(stringField),
            stringFieldValues;

        if (stringFieldValue === "") return;

        commandArguments.push(stringFields[stringField]);

        if (stringField === "allow-data-model-changes" && stringFieldValue === "all") return;

        if (~multiValueStringFields.indexOf(stringField)) {
            stringFieldValues = stringFieldValue.split(" ");
            commandArguments = commandArguments.concat(stringFieldValues);
        } else {
            commandArguments.push(stringFieldValue);
        }
    });
    Object.keys(booleanFields).forEach((booleanField) => {
        let booleanFieldValue = core.getBooleanInput(booleanField);
        if (!booleanFieldValue) return;

        commandArguments.push(booleanFields[booleanField]);
    });

    if (core.getInput("licenses") !== "") {
        let licenses = core.getMultilineInput("licenses");
        licenses.forEach((license) => {
            let licenseParts = splitLicenseParts(license);
            if (licenseParts.length !== 3) {
                core.setFailed(`Invalid license format: ${license}`);
                process.exit();
            }

            commandArguments = commandArguments.concat(['-license', licenseParts[0], licenseParts[1], licenseParts[2]]);
        });
    }

    return commandArguments;
}

function verifyServoyImage(servoyVersion) {
    core.info(`Checking for existence of WAR builder for Servoy version: ${servoyVersion}`);

    // Make sure the provided Servoy version number matches the version format (prevent command injection)
    let servoyVersionFormat = /^\d{4}\.\d{2}(\.\d+)?\.\d{4}$/;
    if (!servoyVersionFormat.test(servoyVersion)) {
        core.setFailed(`Invalid Servoy version: ${servoyVersion}`);
        process.exit();
    }

    const inspectManifestProcess = childProcess.spawnSync(
        'docker',
        ['manifest', 'inspect', `ghcr.io/itechpros/servoy_builder:${servoyVersion}`],
        { encoding: 'utf-8' }
    );
    if (~[null, 1].indexOf(inspectManifestProcess.status)) {
        // Manifest inspect failed (we don't have that version), so let's output what the command output was and set the failure.
        core.info(`Docker return code: ${inspectManifestProcess.status}`);
        core.info(`Docker stdout: ${inspectManifestProcess.stdout}`);
        core.info(`Docker stderr: ${inspectManifestProcess.stderr}`);
        core.setFailed(`Servoy version not found: ${servoyVersion}`);
        process.exit();
    }
}

function splitLicenseParts(license) {
    // Split on space, but allow quotes.
    let licenseRegexp = /[^\s"]+|"([^"]*)"/gi,
        resultArray = [],
        match;
    
        do {
        match = licenseRegexp.exec(license);
        if (match != null)
            resultArray.push(match[1] ? match[1] : match[0]);
    } while (match != null);
    
    return resultArray;
}

function downloadServoyImage(servoyVersion) {
    core.info(`Downloading WAR builder for Servoy version: ${servoyVersion}`);
    const pullProcess = childProcess.spawnSync(
        'docker',
        ['pull', `ghcr.io/itechpros/servoy_builder:${servoyVersion}`],
        { stdio: 'inherit' }
    );
    if (pullProcess.status === null || pullProcess.status !== 0) {
        core.setFailed(`Download of WAR builder failed for Servoy version: ${servoyVersion}`);
        process.exit();
    }
}