import crypto from "crypto";

function hash_token(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default hash_token;
