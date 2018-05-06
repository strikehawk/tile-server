import * as shell from "shelljs";

shell.cp("-R", "src/public/js/lib", "dist/public/js/");
shell.cp("-R", "src/public/fonts", "dist/public/");
shell.cp("-R", "src/public/images", "dist/public/");
shell.cp("-R", "src/public/html/*.*", "dist/public/");

shell.cp("-R", "node_modules/openlayers/dist/ol.*", "dist/public/js/lib");

shell.cp("-R", "config", "dist/config/");