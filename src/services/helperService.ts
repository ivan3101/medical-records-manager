import { hash, verify }from "argon2";
import { EEXIST } from "constants";
import { File } from "formidable";
import { promises } from "fs";
import { isEqual, isObject, transform } from "lodash";
import { join } from "path";

export class HelperService {

    public static hashPassword(password: string): Promise<string> {
        try {
          return hash(password);
        } catch (e) {
          throw e;
        }
    }

    public static verifyPassword(hashedPassword: string, password): Promise<boolean> {
        return verify(hashedPassword, password);
    }

    public static async moveUploads(files: File[], directory: string, newDirectoryName: string): Promise<string[]> {

      const folderPath = join(process.cwd(), "public", directory, newDirectoryName);
      const movePromises: Array<Promise<any>> = [];
      const paths: string[] = [];

      await HelperService.createDirectory(folderPath);

      for (const file of files) {
        const newPath = join(folderPath, file.name);

        const movePromise = HelperService.moveFile(file.path, newPath);

        movePromises.push(movePromise);
        paths.push(`${directory}/${newDirectoryName}/${file.name}`);
      }

      await Promise.all(movePromises);

      return paths;
    }

    public static async deleteFilesInDirectory(folder: string): Promise<any> {
      const deletePromises: Array<Promise<any>> = [];
      const files = await promises.readdir(folder);


      for (const file of files) {
        const deletePromise = promises.unlink(join(folder, file));
        deletePromises.push(deletePromise);
      }

      await Promise.all(deletePromises);

      await promises.rmdir(folder);
  }

    public static async deleteUploads(files: File[]): Promise<any> {
      const deletePromises: Array<Promise<any>> = [];

      for (const file of files) {
        const deletePromise = promises.unlink(file.path);
        deletePromises.push(deletePromise);
      }

      await Promise.all(deletePromises);
    }

    public static objectDiff(object: object, base: object): object {
      return transform(object as any, (result, value, key) => {
        if (!isEqual(value, base[key])) {
          result[key] = isObject(value) && isObject(base[key]) ? HelperService.objectDiff(value, base[key]) : value;
        }
      });
    }

    private static async createDirectory(path: string): Promise<any> {
      try {
        await promises.mkdir(path);
      } catch (error) {
        if (error.code === "EEXIST") {
          return;
        } else {
          throw (error);
        }
      }
    }

    private static async moveFile(previousPath: string, newPath: string): Promise<any> {
      return promises.rename(previousPath, newPath);
    }
}