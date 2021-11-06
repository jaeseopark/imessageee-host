import fs from "fs";
import pathLib from "path";
import { resolveUserHome } from "../util/fspath";

class LocalFileManager {
    appDir: string;

    constructor(appDir: string) {
        this.appDir = resolveUserHome(appDir);
    }

    createAppDir = () => {
        if (!fs.existsSync(this.appDir)) {
            fs.mkdirSync(this.appDir, { recursive: true });
        }
    }

    readString = (path: string) => {
        const fullPath = pathLib.join(this.appDir, path);
        return fs.readFileSync(fullPath, "utf-8");
    }

    readJson = (path: string): any => {
        return JSON.parse(this.readString(path));
    }

    writeJson = (path: string, json: any) => {
        this.createAppDir();
        const fullPath = pathLib.join(this.appDir, path);
        fs.writeFileSync(fullPath, JSON.stringify(json));
    }

    exists = (path: string) => {
        const fullPath = pathLib.join(this.appDir, path);
        return fs.existsSync(fullPath);
    }
}

export default LocalFileManager;
