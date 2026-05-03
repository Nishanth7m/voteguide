import fs from "fs/promises";
import path from "path";

const SESSION_DIR = path.join(process.cwd(), "sessions");

// Ensure directory exists
async function ensureDir() {
  try {
    await fs.access(SESSION_DIR);
  } catch {
    await fs.mkdir(SESSION_DIR, { recursive: true });
  }
}

export const FileSessionStore = {
  async get(id: string) {
    await ensureDir();
    const filePath = path.join(SESSION_DIR, `${id}.json`);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  async set(id: string, data: any) {
    await ensureDir();
    const filePath = path.join(SESSION_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }
};
