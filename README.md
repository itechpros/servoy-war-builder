# Servoy WAR Exporter

This [GitHub Action](https://github.com/features/actions) allows users to build Servoy WAR files, using options from Servoy's bundled WAR export. In order to use this Action, you will need an API key from [Servoy Components](https://servoycomponents.com/components/plugins). You can purchase a license for either GitHub Actions specifically, or our all-inclusive [All Products Pack](https://servoycomponents.com/all-products-pack) license.

## Examples
```yaml
name: Servoy WAR Build
on: push
jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
     - name: Checkout                               # Checkout the repo
       uses: actions/checkout@v2
     - name: Docker Login                           # Login to GitHub's Docker Container Registry
       uses: docker/login-action@v2
       with:
         registry: ghcr.io
         username: ${{ github.actor }}
         password: ${{ secrets.GITHUB_TOKEN }}
     - name: Servoy WAR Build                       # Run the Servoy WAR Build
       uses: itechpros/servoy-war-builder@main
       with:
         servoy-version: 2023.03.2.3844
         api-key: ${{ secrets.SERVOY_COMPONENTS_API_KEY }}
         solution-name: MySolution
         default-admin-user: ${{ secrets.SERVOY_DEFAULT_ADMIN_USER }}
         default-admin-password: ${{ secrets.SERVOY_DEFAULT_ADMIN_PASWORD }}
```

## Options

-  ***servoy-version*** <span style="color: red;">*required*</span>  
   The full Servoy version to use for the build. To see a list of supported versions, please head over to [our servoy_builder package](https://github.com/itechpros/servoy-docker-github/pkgs/container/servoy_builder) to see the versions we support.
- ***api-key*** <span style="color: red;">*required*</span>  
  API key obtained from the ServoyComponents website from either the [commercial license](https://servoycomponents.com/components/plugins) or the [All Products Pack](https://servoycomponents.com/all-products-pack). We recommend putting this value in [GitHub Action Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) to prevent accidental exposure through the GitHub Action logs, or from unauthorized users.
- ***solution-name*** <span style="color: red;">*required*</span>  
  Name of the primary solution to export to the WAR file.
- ***default-admin-user*** <span style="color: red;">*required*</span>  
  Default admin username to include in the WAR file. We recommend putting this value in [GitHub Action Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) to prevent accidental exposure through the GitHub Action logs, or from unauthorized users.
- ***default-admin-password*** <span style="color: red;">*required*</span>  
  Default admin password to include in the WAR file. We recommend putting this value in [GitHub Action Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) to prevent accidental exposure through the GitHub Action logs, or from unauthorized users.
- ***properties-file***  
  Path and name of the properties file used to start the exporter. Path should be relative to the root directory of your GitHub repository.
- ***ignore-build-errors***  
  Ignores build errors <span style="color: yellow;">(warning: use of this flag is discouraged; it can cause invalid solutions to be exported)</span>  
  **Default:** false  
- ***skip-build***  
  No build markers will be generated. This can greatly decrease export time <span style="color: yellow;">(warning: use of this flag is discouraged; it can cause invalid solutions to be exported)</span>  
  **Default:** false
- ***dbi***  
  Export based on DBI files (even if database servers are available).
  **Default:** false
- ***properties-file-war***  
  Path and name of the properties file to be included in the WAR. Path should be relative to the root directory of your GitHub repository.
- ***beans***  
  Space separated list of (smart/web client) beans to export  
  **Default:** all beans are exported
- ***exclude-beans***  
  Space separated list of beans to be excluded from the export
- ***lafs***  
  Space separated list of look-and-feels (smart client) to export  
  **Default:** all lafs are exported
- ***exclude-lafs***  
  Space separated list of look-and-feels to be excluded from the export
- ***drivers***  
  Space separated list of JDBC (database) drivers to export  
  **Default:** all drivers are exported
- ***exclude-drivers***  
  Space separated list of drivers to be excluded from the export
- ***plugins***  
  Space separated list of plugins to export  
  **Default:** all plugins are exported
- ***exclude-plugins***  
  Space separated list of plugins to be excluded from the export
- ***components***  
  Space separated list of components to export  
  **Default:** all
- ***exclude-components***  
  Space separated list of components to be excluded from the export
- ***services***  
  Space separated list of services to export  
  **Default:** all
- ***exclude-services***  
  Space separated list of services to be excluded from the export
- ***additional-solutions***  
  Space separated list of solutions that must be exported, but are not in the current solution's modules (for example, solutions for batch processors)
- ***export-metadata***  
  Export metadata tables  
  **Default:** false
- ***check-metadata***  
  Check that metadata for metadata tables is the same for each table, both in the according workspace file and in the actual table in the database before exporting  
  **Default:** false
- ***sample-data***  
  Export sample data  
  **Default:** false
- ***sample-data-row-count***  
  Number of rows of sample data to export per table
- ***i18n***  
  Export i18n data  
  **Default:** false
- ***users***  
  Exports users  
  **Default:** false
- ***tables***  
  Export all table information about tables from referenced servers  
  **Default:** false
- ***war-file-name***  
  The name of the WAR file
- ***overwrite-groups***  
  Overwrites groups  
  **Default:** false
- ***allow-sql-keywords***  
  Allows SQL keywords  
  **Default:** false
- ***stop-on-data-model-changes***  
  Stops import if the data model changes  
  **Default:** false
- ***allow-data-model-changes***  
  A space separated list of server names that allow data model changes. If the value is "all", then data model changes are allowed on all servers
- ***skip-database-views-update***  
  Skips database views update  
  **Default:** false
- ***override-sequence-types***  
  Overrides sequence types  
  **Default:** false
- ***override-default-values***  
  Overrides default values  
  **Default:** false
- ***insert-new-i18n-keys-only***  
  Inserts new i18n keys only  
  **Default:** false
- ***import-user-policy***  
  0 = don't  
  1 = create users & update groups  
  2 = overwrite completely
- ***add-users-to-admin-group***  
  Adds users to admin group  
  **Default:** false
- ***update-sequences***  
  Updates sequences  
  **Default:** false
- ***upgrade-repository***  
  Automatically upgrade repository if needed  
  **Default:** false
- ***context-file-name***  
  Path to a Tomcat context.xml that should be included into the WAR/META-INF/context.xml. Path should be relative to the root directory of your GitHub repository.
- ***use-as-real-admin-user***  
  The default user login will be available as a normal admin user in the solutions as well  
  **Default:** false
- ***do-not-overwrite-db-server-properties***  
  SKIP overwrite of old DB server properties  
  **Default:** false
- ***overwrite-all-properties***  
  Overwrite all (potentially changed via admin page) properties of a previously deployed WAR application with the values from the servoy.properties of this WAR export  
  **Default:** false
- ***log4j-configuration-file***  
  A path to a Log4J configuration file that should be included instead of the default one. Path should be relative to the root directory of your GitHub repository.
- ***web-xml-file-name***  
  A path to a web.xml that should be included instead of the default one. Path should be relative to the root directory of your GitHub repository.
- ***ng2***  
  Export Titanium NG2 binaries. If 'sourcemaps' is given, sourcemaps will be generated for .ts files - useful for debugging
- ***ng1***  
  Export NG1 client resources  
  **Default:** false
- ***licenses***  
  Space delimited licenses to include in the WAR file. Format should be '<company_name> <license code> <licenses>'. If you have multiple licenses, use multiple lines.
- ***extras-folder***  
  Path to the extras folder that contains additional plugins, drivers, etc. that should be included in the Servoy install.
