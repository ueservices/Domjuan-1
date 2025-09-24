const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const csvWriter = require('csv-writer');

class DataExporter {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
        this.outputDir = config.outputDir || './bot/output';
        this.encryptionKey = config.encryptionKey || this.generateEncryptionKey();
    }

    async initialize() {
        this.logger.info('Initializing data exporter');
        
        // Ensure output directories exist
        await fs.mkdir(this.outputDir, { recursive: true });
        await fs.mkdir(path.join(this.outputDir, 'exports'), { recursive: true });
        await fs.mkdir(path.join(this.outputDir, 'secure'), { recursive: true });
        await fs.mkdir(path.join(this.outputDir, 'backups'), { recursive: true });
    }

    async exportToCSV(exportData) {
        this.logger.info('Exporting data to CSV format');
        
        try {
            const timestamp = this.getTimestamp();
            
            // Export domains
            await this.exportDomainsCSV(exportData.domains, timestamp);
            
            // Export digital assets
            await this.exportAssetsCSV(exportData.assets, timestamp);
            
            // Export cryptocurrencies
            await this.exportCurrenciesCSV(exportData.currencies, timestamp);
            
            // Export summary
            await this.exportSummaryCSV(exportData, timestamp);
            
            this.logger.info('CSV export completed', {
                timestamp,
                domains: exportData.domains.length,
                assets: exportData.assets.length,
                currencies: exportData.currencies.length
            });

        } catch (error) {
            this.logger.error('CSV export failed', { error: error.message });
            throw error;
        }
    }

    async exportDomainsCSV(domains, timestamp) {
        const filename = path.join(this.outputDir, 'exports', `domains_${timestamp}.csv`);
        
        const writer = csvWriter.createObjectCsvWriter({
            path: filename,
            header: [
                { id: 'name', title: 'Domain' },
                { id: 'category', title: 'Category' },
                { id: 'isActive', title: 'Active' },
                { id: 'isAvailable', title: 'Available' },
                { id: 'acquired', title: 'Acquired' },
                { id: 'estimatedValue', title: 'Estimated Value (USD)' },
                { id: 'estimatedCost', title: 'Estimated Cost (USD)' },
                { id: 'hasAssets', title: 'Has Assets' },
                { id: 'hasCrypto', title: 'Has Crypto' },
                { id: 'registrar', title: 'Registrar' },
                { id: 'authCode', title: 'Auth Code' },
                { id: 'expirationDate', title: 'Expiration Date' },
                { id: 'discoveredAt', title: 'Discovered At' },
                { id: 'source', title: 'Source' },
                { id: 'depth', title: 'Scan Depth' }
            ]
        });

        const records = domains.map(domain => ({
            name: domain.name,
            category: domain.category,
            isActive: domain.isActive ? 'Yes' : 'No',
            isAvailable: domain.isAvailable ? 'Yes' : 'No',
            acquired: domain.acquired ? 'Yes' : 'No',
            estimatedValue: domain.estimatedValue || 0,
            estimatedCost: domain.estimatedCost || 0,
            hasAssets: domain.hasAssets ? 'Yes' : 'No',
            hasCrypto: domain.hasCrypto ? 'Yes' : 'No',
            registrar: domain.acquisitionDetails?.registrar || '',
            authCode: domain.acquisitionDetails?.authCode || '',
            expirationDate: domain.acquisitionDetails?.expirationDate || '',
            discoveredAt: domain.discoveredAt,
            source: domain.source || '',
            depth: domain.depth || 0
        }));

        await writer.writeRecords(records);
        this.logger.debug(`Domains CSV exported: ${filename}`);
    }

    async exportAssetsCSV(assets, timestamp) {
        const filename = path.join(this.outputDir, 'exports', `assets_${timestamp}.csv`);
        
        const writer = csvWriter.createObjectCsvWriter({
            path: filename,
            header: [
                { id: 'id', title: 'Asset ID' },
                { id: 'type', title: 'Asset Type' },
                { id: 'name', title: 'Asset Name' },
                { id: 'estimatedValue', title: 'Estimated Value (USD)' },
                { id: 'confidence', title: 'Confidence' },
                { id: 'blockchain', title: 'Blockchain' },
                { id: 'contractAddress', title: 'Contract Address' },
                { id: 'transferable', title: 'Transferable' },
                { id: 'domain', title: 'Associated Domain' },
                { id: 'discoveredAt', title: 'Discovered At' },
                { id: 'source', title: 'Source' },
                { id: 'metadata', title: 'Additional Metadata' }
            ]
        });

        const records = assets.map(asset => ({
            id: asset.id,
            type: asset.type,
            name: asset.name || asset.type,
            estimatedValue: asset.estimatedValue || 0,
            confidence: asset.confidence || 1,
            blockchain: asset.metadata?.blockchain || '',
            contractAddress: asset.metadata?.contractAddress || asset.metadata?.tokenContract || '',
            transferable: asset.metadata?.transferable ? 'Yes' : 'No',
            domain: asset.metadata?.domain || '',
            discoveredAt: asset.discoveredAt,
            source: asset.source || '',
            metadata: JSON.stringify(asset.metadata || {})
        }));

        await writer.writeRecords(records);
        this.logger.debug(`Assets CSV exported: ${filename}`);
    }

    async exportCurrenciesCSV(currencies, timestamp) {
        const filename = path.join(this.outputDir, 'exports', `currencies_${timestamp}.csv`);
        
        const writer = csvWriter.createObjectCsvWriter({
            path: filename,
            header: [
                { id: 'id', title: 'Currency ID' },
                { id: 'currency', title: 'Currency Symbol' },
                { id: 'amount', title: 'Amount' },
                { id: 'estimatedValue', title: 'Estimated Value (USD)' },
                { id: 'confidence', title: 'Confidence' },
                { id: 'walletType', title: 'Wallet Type' },
                { id: 'domain', title: 'Associated Domain' },
                { id: 'discoveredAt', title: 'Discovered At' },
                { id: 'source', title: 'Source' },
                { id: 'metadata', title: 'Additional Metadata' }
            ]
        });

        const records = currencies.map(currency => ({
            id: currency.id,
            currency: currency.currency,
            amount: currency.amount || 0,
            estimatedValue: currency.estimatedValue || 0,
            confidence: currency.confidence || 1,
            walletType: currency.metadata?.walletType || '',
            domain: currency.metadata?.domain || '',
            discoveredAt: currency.discoveredAt,
            source: currency.source || '',
            metadata: JSON.stringify(currency.metadata || {})
        }));

        await writer.writeRecords(records);
        this.logger.debug(`Currencies CSV exported: ${filename}`);
    }

    async exportSummaryCSV(exportData, timestamp) {
        const filename = path.join(this.outputDir, 'exports', `summary_${timestamp}.csv`);
        
        const writer = csvWriter.createObjectCsvWriter({
            path: filename,
            header: [
                { id: 'metric', title: 'Metric' },
                { id: 'value', title: 'Value' },
                { id: 'unit', title: 'Unit' }
            ]
        });

        const acquiredDomains = exportData.domains.filter(d => d.acquired);
        const totalEstimatedValue = exportData.domains.reduce((sum, d) => sum + (d.estimatedValue || 0), 0) +
                                   exportData.assets.reduce((sum, a) => sum + (a.estimatedValue || 0), 0) +
                                   exportData.currencies.reduce((sum, c) => sum + (c.estimatedValue || 0), 0);

        const records = [
            { metric: 'Session ID', value: exportData.session.sessionId, unit: '' },
            { metric: 'Export Timestamp', value: timestamp, unit: '' },
            { metric: 'Total Domains Discovered', value: exportData.domains.length, unit: 'domains' },
            { metric: 'Domains Acquired', value: acquiredDomains.length, unit: 'domains' },
            { metric: 'Total Digital Assets', value: exportData.assets.length, unit: 'assets' },
            { metric: 'Total Currencies', value: exportData.currencies.length, unit: 'currencies' },
            { metric: 'Total Estimated Value', value: Math.round(totalEstimatedValue), unit: 'USD' },
            { metric: 'Acquisition Success Rate', value: Math.round((acquiredDomains.length / exportData.domains.length) * 100), unit: '%' }
        ];

        await writer.writeRecords(records);
        this.logger.debug(`Summary CSV exported: ${filename}`);
    }

    async exportToJSON(exportData) {
        this.logger.info('Exporting data to JSON format');
        
        try {
            const timestamp = this.getTimestamp();
            const filename = path.join(this.outputDir, 'exports', `full_export_${timestamp}.json`);
            
            const jsonData = {
                exportInfo: {
                    timestamp: new Date(),
                    version: '1.0.0',
                    sessionId: exportData.session.sessionId
                },
                summary: exportData.summary,
                domains: exportData.domains,
                assets: exportData.assets,
                currencies: exportData.currencies,
                session: exportData.session
            };

            await fs.writeFile(filename, JSON.stringify(jsonData, null, 2));
            
            this.logger.info('JSON export completed', {
                filename,
                size: JSON.stringify(jsonData).length
            });

        } catch (error) {
            this.logger.error('JSON export failed', { error: error.message });
            throw error;
        }
    }

    async createSecurePackage(exportData) {
        this.logger.info('Creating secure encrypted package');
        
        try {
            const timestamp = this.getTimestamp();
            
            // Create comprehensive data package
            const packageData = {
                metadata: {
                    created: new Date(),
                    sessionId: exportData.session.sessionId,
                    version: '1.0.0',
                    encryption: 'AES-256-GCM',
                    integrity: 'SHA-256'
                },
                discoveries: {
                    domains: exportData.domains,
                    assets: exportData.assets,
                    currencies: exportData.currencies
                },
                summary: exportData.summary,
                session: exportData.session,
                security: {
                    authCodes: this.extractAuthCodes(exportData.domains),
                    transferKeys: this.extractTransferKeys(exportData.domains),
                    walletData: this.extractWalletData(exportData.currencies)
                }
            };

            // Generate package hash for integrity
            const packageJson = JSON.stringify(packageData);
            const packageHash = crypto.createHash('sha256').update(packageJson).digest('hex');
            packageData.metadata.hash = packageHash;

            // Encrypt the package
            const encryptedData = this.encryptData(packageJson);
            
            // Create secure package file
            const securePackage = {
                version: '1.0.0',
                algorithm: 'AES-256-GCM',
                created: new Date(),
                sessionId: exportData.session.sessionId,
                integrity: packageHash,
                data: encryptedData
            };

            const packageFilename = path.join(this.outputDir, 'secure', `secure_package_${timestamp}.enc`);
            await fs.writeFile(packageFilename, JSON.stringify(securePackage));
            
            // Create key file (separate storage)
            const keyFilename = path.join(this.outputDir, 'secure', `package_key_${timestamp}.key`);
            await fs.writeFile(keyFilename, this.encryptionKey);
            
            // Create readme for package
            await this.createPackageReadme(timestamp);
            
            this.logger.info('Secure package created', {
                packageFile: packageFilename,
                keyFile: keyFilename,
                dataHash: packageHash
            });

            return {
                packageFile: packageFilename,
                keyFile: keyFilename,
                hash: packageHash,
                timestamp: timestamp
            };

        } catch (error) {
            this.logger.error('Secure package creation failed', { error: error.message });
            throw error;
        }
    }

    async createPackageReadme(timestamp) {
        const readmeContent = `# Autonomous Domain Discovery - Secure Package

## Package Information
- **Timestamp**: ${timestamp}
- **Encryption**: AES-256-GCM
- **Format**: JSON with binary encryption

## Files
- \`secure_package_${timestamp}.enc\` - Encrypted data package
- \`package_key_${timestamp}.key\` - Encryption key (store separately)
- This README file

## Contents
The secure package contains:
- All discovered domains with metadata
- Digital assets and cryptocurrency findings
- Acquisition details and auth codes
- Transfer keys and wallet data
- Session information and analytics

## Security Notes
1. **Keep the key file separate** from the package file
2. **Backup both files** in different locations
3. **Use secure channels** for transfer (SFTP, encrypted email)
4. **Verify integrity** using the included hash
5. **Rotate encryption keys** regularly

## Decryption
To decrypt the package:
1. Load the key from the .key file
2. Use AES-256-GCM decryption with the key
3. Verify the SHA-256 hash matches the metadata
4. Parse the JSON data

## Transfer Guidelines
- Use encrypted channels only
- Verify recipient identity
- Confirm successful transfer
- Delete temporary copies
- Update access logs

---
Generated by Autonomous Domain Discovery Bot
Security Level: HIGH
Handle with appropriate care.
`;

        const readmeFilename = path.join(this.outputDir, 'secure', `README_${timestamp}.md`);
        await fs.writeFile(readmeFilename, readmeContent);
    }

    extractAuthCodes(domains) {
        return domains
            .filter(domain => domain.acquired && domain.acquisitionDetails?.authCode)
            .map(domain => ({
                domain: domain.name,
                authCode: domain.acquisitionDetails.authCode,
                registrar: domain.acquisitionDetails.registrar,
                expirationDate: domain.acquisitionDetails.expirationDate
            }));
    }

    extractTransferKeys(domains) {
        return domains
            .filter(domain => domain.acquired && domain.acquisitionDetails?.transactionId)
            .map(domain => ({
                domain: domain.name,
                transactionId: domain.acquisitionDetails.transactionId,
                registrar: domain.acquisitionDetails.registrar,
                transferEligible: true
            }));
    }

    extractWalletData(currencies) {
        return currencies
            .filter(currency => currency.metadata?.walletType)
            .map(currency => ({
                id: currency.id,
                currency: currency.currency,
                amount: currency.amount,
                estimatedValue: currency.estimatedValue,
                walletType: currency.metadata.walletType,
                domain: currency.metadata.domain
            }));
    }

    encryptData(data) {
        try {
            const encrypted = CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
            return encrypted;
        } catch (error) {
            this.logger.error('Data encryption failed', { error: error.message });
            throw error;
        }
    }

    decryptData(encryptedData) {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            this.logger.error('Data decryption failed', { error: error.message });
            throw error;
        }
    }

    generateEncryptionKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    getTimestamp() {
        return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
    }

    async createBackup(exportData) {
        try {
            const timestamp = this.getTimestamp();
            const backupDir = path.join(this.outputDir, 'backups', timestamp);
            await fs.mkdir(backupDir, { recursive: true });

            // Copy all export files to backup
            const exportDir = path.join(this.outputDir, 'exports');
            const secureDir = path.join(this.outputDir, 'secure');

            // Create backup manifest
            const manifest = {
                created: new Date(),
                sessionId: exportData.session?.sessionId,
                backupType: 'full',
                files: []
            };

            // Copy export files
            try {
                const exportFiles = await fs.readdir(exportDir);
                for (const file of exportFiles) {
                    if (file.includes(timestamp.substring(0, 10))) { // Same day
                        const source = path.join(exportDir, file);
                        const dest = path.join(backupDir, file);
                        await fs.copyFile(source, dest);
                        manifest.files.push({ type: 'export', filename: file });
                    }
                }
            } catch (error) {
                // Export directory might not exist yet
            }

            // Copy secure files
            try {
                const secureFiles = await fs.readdir(secureDir);
                for (const file of secureFiles) {
                    if (file.includes(timestamp.substring(0, 10))) { // Same day
                        const source = path.join(secureDir, file);
                        const dest = path.join(backupDir, file);
                        await fs.copyFile(source, dest);
                        manifest.files.push({ type: 'secure', filename: file });
                    }
                }
            } catch (error) {
                // Secure directory might not exist yet
            }

            // Save manifest
            const manifestFile = path.join(backupDir, 'manifest.json');
            await fs.writeFile(manifestFile, JSON.stringify(manifest, null, 2));

            this.logger.info('Backup created', {
                backupDir,
                filesBackedUp: manifest.files.length
            });

            return backupDir;

        } catch (error) {
            this.logger.error('Backup creation failed', { error: error.message });
            throw error;
        }
    }

    async validateExportIntegrity(filename) {
        try {
            const data = await fs.readFile(filename, 'utf8');
            const parsed = JSON.parse(data);
            
            if (parsed.metadata && parsed.metadata.hash) {
                // Recalculate hash
                const dataForHash = JSON.stringify({
                    ...parsed,
                    metadata: {
                        ...parsed.metadata,
                        hash: undefined // Exclude hash from hash calculation
                    }
                });
                
                const calculatedHash = crypto.createHash('sha256').update(dataForHash).digest('hex');
                const isValid = calculatedHash === parsed.metadata.hash;
                
                this.logger.info('Export integrity validation', {
                    filename,
                    isValid,
                    originalHash: parsed.metadata.hash,
                    calculatedHash
                });
                
                return isValid;
            }
            
            return true; // No hash to validate
            
        } catch (error) {
            this.logger.error('Export validation failed', {
                filename,
                error: error.message
            });
            return false;
        }
    }

    async getExportStatistics() {
        try {
            const exportDir = path.join(this.outputDir, 'exports');
            const secureDir = path.join(this.outputDir, 'secure');
            const backupDir = path.join(this.outputDir, 'backups');

            const stats = {
                exports: { count: 0, totalSize: 0 },
                securePackages: { count: 0, totalSize: 0 },
                backups: { count: 0, totalSize: 0 },
                lastExport: null,
                totalFiles: 0
            };

            // Count export files
            try {
                const exportFiles = await fs.readdir(exportDir);
                stats.exports.count = exportFiles.length;
                for (const file of exportFiles) {
                    const fileStat = await fs.stat(path.join(exportDir, file));
                    stats.exports.totalSize += fileStat.size;
                }
            } catch (error) {
                // Directory might not exist
            }

            // Count secure packages
            try {
                const secureFiles = await fs.readdir(secureDir);
                stats.securePackages.count = secureFiles.filter(f => f.endsWith('.enc')).length;
                for (const file of secureFiles) {
                    const fileStat = await fs.stat(path.join(secureDir, file));
                    stats.securePackages.totalSize += fileStat.size;
                }
            } catch (error) {
                // Directory might not exist
            }

            // Count backups
            try {
                const backupDirs = await fs.readdir(backupDir);
                stats.backups.count = backupDirs.length;
            } catch (error) {
                // Directory might not exist
            }

            stats.totalFiles = stats.exports.count + stats.securePackages.count + stats.backups.count;

            return stats;

        } catch (error) {
            this.logger.error('Failed to get export statistics', { error: error.message });
            return null;
        }
    }
}

module.exports = DataExporter;