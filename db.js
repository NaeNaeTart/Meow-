const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.cache = {};
        this.saveQueue = new Set();
        this.saving = false;
        
        // Ensure all DB files exist and load them into memory
        this.files = ['economy.json', 'warns.json', 'afk.json', 'vclocks.json', 'paws.json', 'scratches.json'];
        for (const file of this.files) {
            const fp = path.join(__dirname, file);
            if (!fs.existsSync(fp)) {
                fs.writeFileSync(fp, '{}');
            }
            try {
                this.cache[file] = JSON.parse(fs.readFileSync(fp, 'utf8'));
            } catch (e) {
                console.error(`[DB] Error parsing ${file}, resetting to empty object.`);
                this.cache[file] = {};
                fs.writeFileSync(fp, '{}');
            }
        }
    }

    /**
     * Get the cached data for a specific file.
     * @param {string} file - The filename (e.g., 'economy.json')
     * @returns {Object} The cached JSON object.
     */
    get(file) {
        return this.cache[file];
    }

    /**
     * Mark a file for saving after making changes to its cached data.
     * @param {string} file - The filename (e.g., 'economy.json')
     */
    save(file) {
        this.saveQueue.add(file);
        this.processQueue();
    }

    async processQueue() {
        if (this.saving || this.saveQueue.size === 0) return;
        this.saving = true;

        const fileToSave = [...this.saveQueue][0];
        this.saveQueue.delete(fileToSave);

        try {
            await fs.promises.writeFile(
                path.join(__dirname, fileToSave), 
                JSON.stringify(this.cache[fileToSave], null, 2)
            );
        } catch (e) {
            console.error(`[DB] Failed to save ${fileToSave}`, e);
        }

        this.saving = false;
        if (this.saveQueue.size > 0) {
            this.processQueue();
        }
    }
}

module.exports = new Database();
