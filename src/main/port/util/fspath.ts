export const resolveUserHome = (relativePath: string) => relativePath.replace("~", process.env.HOME!);
