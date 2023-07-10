/* This file contains teardown logic for the WAR build */

const core = require("@actions/core");
const childProcess = require("child_process");

try {
    const servoyVersion = core.getInput("servoy-version");

    // Delete the local WAR builder image, if we have it.
    const inspectImageProcess = childProcess.spawnSync(
        'docker',
        ['image', 'inspect', `ghcr.io/itechpros/servoy_buider:${servoyVersion}`]
    );
    if (inspectImageProcess.status === 0) {
        // Image exists locally, so delete it.
        core.info(`Deleting local WAR builder for Servoy version: ${servoyVersion}`);

        const removeImageProcess = childProcess.spawnSync(
            'docker',
            ['rmi', `ghcr.io/itechpros/servoy_builder:${servoyVersion}`]
        );
        if (removeImageProcess.status !== 0)
            core.info(`Failed to remove local WAR builder for Servoy version: ${servoyVersion}`);
    }
} catch (e) {
    // Don't fail the build if we're unable to clean up. Just log it.
    console.error(e.message);
}