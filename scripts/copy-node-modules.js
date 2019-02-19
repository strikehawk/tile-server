var path = require("path");
var os = require("os");
var fs = require("fs-extra");
var _ = require("lodash");
var dependencyTree = require("dependency-tree");

var packPath = "./pack";
var distPath = "./dist";
var nodeModulesPath = path.resolve("./node_modules");

var packageJson = require(path.resolve("./package.json"));
var title = packageJson.description;
var port = 8000;

/**
 * Analyse the specified node module and recursively add all its dependencies to the given set.
 * @param nodeModulesPath The absolute path to the 'node_modules' directory.
 * @param modPath The path to the module being analyzed.
 * @param set The set to fill with the dependencies of the module.
 */
function findModuleDependencies(nodeModulesPath, modPath, set) {
  // read package.json file of the module
  var packageJsonPath = path.join(modPath, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  var packageJson = require(packageJsonPath);

  for (let dep in packageJson.dependencies) {
    var pathDep = path.resolve(nodeModulesPath, dep);
    if (!set.has(pathDep)) {
      set.add(pathDep);

      // a new dependency has been found. Explore it recursively
      findModuleDependencies(nodeModulesPath, pathDep, set);
    }
  }
}

/**
 * Build a list of dependency modules for a given file.
 * @param nodeModulesPath The absolute path to the 'node_modules' directory.
 * @param filePath The path to the file to analyze.
 * @returns A Set containing the full path to each module the target file depends on.
 */
function getAppDependencies(nodeModulesPath, filePath) {
  var directory = path.dirname(filePath);

  var list = dependencyTree.toList({
    filename: filePath,
    directory: directory,
  });

  var result = new Set();
  list.forEach(p => {
    var dirname = path.dirname(p);
    var idx = dirname.indexOf("node_modules");

    if (idx !== -1) {
      dirname = dirname.replace(path.join(nodeModulesPath, path.sep), "");
      var idx2 = dirname.indexOf(path.sep);
      if (idx2 !== -1) {
        result.add(path.resolve(nodeModulesPath, dirname.slice(0, idx2)));
      } else {
        result.add(path.resolve(nodeModulesPath, dirname));
      }
    }
  });

  return result;
}

// build a dependency list of the server app
var set = getAppDependencies(nodeModulesPath, "./dist/app.js");

// fix missing dependencies
set.add(path.resolve(nodeModulesPath, "pug")); // pug dependency is not caught

// get the nested dependencies
for (let m of set) {
  findModuleDependencies(nodeModulesPath, m, set);
}

// delete packPath if it exists
fs.removeSync(packPath);

// create packPath
fs.ensureDirSync(packPath);

// // debug - create a file containing the node module names to copy
// const filename = path.join(packPath, "deps.json");
// fs.writeFileSync(path.resolve(filename), JSON.stringify(Array.from(set)), "utf-8");

// copy node_modules
for (let m of set) {
  var targetPath = m.slice(m.indexOf("node_modules"));
  fs.copy(m, path.join(packPath, targetPath));
}

// copy dist content to 'packPath'
fs.copy(distPath, packPath);

// create the .cmd file to run the server
var stream = fs.createWriteStream(path.join(packPath, "start.cmd"));
stream.write(`ECHO OFF${os.EOL}`);
stream.write(`TITLE ${title}${os.EOL}`);
stream.write(`SET PORT=${port}${os.EOL}`);
stream.write(`node app.js${os.EOL}`);
stream.write(`PAUSE${os.EOL}`);
stream.end();