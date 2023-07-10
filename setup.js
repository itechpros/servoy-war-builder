/* This file contains pre-checks and setup to prepare for the WAR build */

const core = require("@actions/core");
const childProcess = require("child_process");

try {
    // Check to make sure the requested Servoy version exists in our GitHub Container Registry
    const servoyVersion = core.getInput("servoy-version");
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
        core.debug(inspectManifestProcess.stdout);
        core.setFailed(`Servoy version not found: ${servoyVersion}`);
        process.exit();
    }

    // Pull down the Docker image
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
} catch (e) {
    core.setFailed(e.message);
}