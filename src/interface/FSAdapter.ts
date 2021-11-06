import fs from "fs";
import pathLib from "path";
import { resolveUserHome } from "../util/fspath";

class FSAdapter {
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
        if (!fs.existsSync(fullPath)) return null;
        return fs.readFileSync(fullPath, "utf-8");
    }

    writeString = (path: string, data: string) => {
        this.createAppDir();
        const fullPath = pathLib.join(this.appDir, path);
        fs.writeFileSync(fullPath, data);
    }

    readJson = (path: string): any => {
        const fullPath = pathLib.join(this.appDir, path);
        if (!fs.existsSync(fullPath)) return null;
        return JSON.parse(this.readString(path)!);
    }

    writeJson = (path: string, data: any) => {
        this.writeString(path, JSON.stringify(data));
    }

    exists = (path: string) => {
        const fullPath = pathLib.join(this.appDir, path);
        return fs.existsSync(fullPath);
    }
}

export default FSAdapter;
