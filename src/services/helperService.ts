import { hash, verify }from "argon2";

export class HelperService {

    public static hashPassword(password: string): Promise<string> {
        return hash(password);
    }

    public static verifyPassword(hashedPassword: string, password): Promise<boolean> {
        return verify(hashedPassword, password);
    }
}