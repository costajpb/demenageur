# demenageur

If you use NPM to share front-end assets and putting `node_modules` folder in the way is a concern of yours, you probably have been through a hard time figuring out how to put this stuff in use. Although there is no standardized way of exposing things from inside packages, one should not be digging into modules since they're supposed to be self-contained. If `demenageur` is not supposed to become a standard for that, at least it might come in handy if all you wish is to seamlessly use things dependencies are meant to bring you.

## Rehousing your assets
`demenageur` is a CLI program that will try to move things from your dependencies to your workspace based on prior configuration. It assumes that a module that is supposed to provide assets could do better if it would come up with something like an "API" as its `main` entry point, since requiring a CSS file or an image would make no sense. That API shall be used to be matched against what is specified in the entry named after the dependency module under `config.demenageur` field of the dependent module. A match will make `demenageur` move the related asset to the specified path in the workspace.

### Example
#### Dependent module package
```
{
  "name": "dependent",
  "version": "0.0.1",
  ...
  "config": {
    "demenageur": {
      "dependency": {
        "key": "where/to/place/in/workspace"
      }
    }
  },
  ...
  "dependencies": {
    "dependency": "^0.0.1"
  }
}
```

#### Required dependency
```
{
  "key": "absolute/path/of/asset"
}
```
In this example, `dependency` would be required. `key` would perform a match and the file placed in `absolute/path/of/asset` would be brought to `where/to/place/in/workspace`, relative to the dependent `package.json` file location.

**IMPORTANT:** the absolute path for the asset to be rehoused is a must use. `__dirname` can be prepended to the relative path of the dependency file to accomplish that.

## Watching for changes
`demenageur` will watch for changes in matched files in order to keep the sync. This is useful when editing dependent and dependency modules at the same time. This is a default behavior, but it can be supressed if `--no-watch` flag is provided.
