const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const logger = require('../config/logger');
const { rateLimiters } = require('../middleware/security');

const execAsync = promisify(exec);

// Apply strict rate limiting to backup endpoints
router.use(rateLimiters.export);

/**
 * @swagger
 * /api/backup/create:
 *   post:
 *     summary: Create a manual backup
 *     tags: [Backup]
 *     responses:
 *       200:
 *         description: Backup created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 backupPath:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       500:
 *         description: Backup creation failed
 */
router.post('/create', async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(process.cwd(), 'backups');
        const backupPath = path.join(backupDir, `manual-backup-${timestamp}.tar.gz`);
        
        // Ensure backup directory exists
        await fs.mkdir(backupDir, { recursive: true });
        
        // Create backup using the existing script
        const backupScript = path.join(process.cwd(), 'scripts', 'backup.sh');
        await execAsync(`bash ${backupScript}`);
        
        logger.info('Manual backup created', {
            backupPath,
            timestamp,
            ip: req.ip,
            component: 'backup'
        });
        
        res.json({
            success: true,
            backupPath: path.basename(backupPath),
            timestamp: new Date().toISOString(),
            message: 'Backup created successfully'
        });
        
    } catch (error) {
        logger.error('Manual backup failed', {
            error: error.message,
            ip: req.ip,
            component: 'backup'
        });
        
        res.status(500).json({
            success: false,
            error: 'Backup creation failed',
            message: process.env.NODE_ENV === 'production' ? 
                'Unable to create backup' : error.message
        });
    }
});

/**
 * @swagger
 * /api/backup/list:
 *   get:
 *     summary: List available backups
 *     tags: [Backup]
 *     responses:
 *       200:
 *         description: List of available backups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 backups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       created:
 *                         type: string
 *                         format: date-time
 */
router.get('/list', async (req, res) => {
    try {
        const backupDir = path.join(process.cwd(), 'backups');
        
        try {
            const files = await fs.readdir(backupDir);
            const backups = [];
            
            for (const file of files) {
                if (file.endsWith('.tar.gz') || file.endsWith('.json') || file.endsWith('.csv')) {
                    const filePath = path.join(backupDir, file);
                    const stats = await fs.stat(filePath);
                    
                    backups.push({
                        filename: file,
                        size: stats.size,
                        created: stats.birthtime.toISOString(),
                        modified: stats.mtime.toISOString()
                    });
                }
            }
            
            // Sort by creation date (newest first)
            backups.sort((a, b) => new Date(b.created) - new Date(a.created));
            
            logger.info('Backup list requested', {
                count: backups.length,
                ip: req.ip,
                component: 'backup'
            });
            
            res.json({
                backups,
                count: backups.length,
                timestamp: new Date().toISOString()
            });
            
        } catch (dirError) {
            // Backup directory doesn't exist
            res.json({
                backups: [],
                count: 0,
                timestamp: new Date().toISOString(),
                message: 'No backups directory found'
            });
        }
        
    } catch (error) {
        logger.error('Backup list failed', {
            error: error.message,
            ip: req.ip,
            component: 'backup'
        });
        
        res.status(500).json({
            error: 'Failed to list backups',
            message: process.env.NODE_ENV === 'production' ? 
                'Unable to list backups' : error.message
        });
    }
});

/**
 * @swagger
 * /api/backup/download/{filename}:
 *   get:
 *     summary: Download a specific backup file
 *     tags: [Backup]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Backup filename
 *     responses:
 *       200:
 *         description: Backup file download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Backup file not found
 */
router.get('/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        // Security: Only allow specific file extensions and no path traversal
        if (!/^[a-zA-Z0-9_-]+\.(tar\.gz|json|csv)$/.test(filename)) {
            return res.status(400).json({
                error: 'Invalid filename',
                message: 'Only backup files are allowed'
            });
        }
        
        const backupPath = path.join(process.cwd(), 'backups', filename);
        
        // Check if file exists
        try {
            await fs.access(backupPath);
        } catch {
            return res.status(404).json({
                error: 'Backup not found',
                message: 'The requested backup file does not exist'
            });
        }
        
        logger.info('Backup download requested', {
            filename,
            ip: req.ip,
            component: 'backup'
        });
        
        res.download(backupPath, filename);
        
    } catch (error) {
        logger.error('Backup download failed', {
            error: error.message,
            filename: req.params.filename,
            ip: req.ip,
            component: 'backup'
        });
        
        res.status(500).json({
            error: 'Download failed',
            message: process.env.NODE_ENV === 'production' ? 
                'Unable to download backup' : error.message
        });
    }
});

/**
 * @swagger
 * /api/backup/restore:
 *   post:
 *     summary: Restore from a backup (DANGEROUS - Production use only)
 *     tags: [Backup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Backup filename to restore from
 *               confirm:
 *                 type: boolean
 *                 description: Must be true to confirm restore operation
 *     responses:
 *       200:
 *         description: Restore completed successfully
 *       400:
 *         description: Invalid restore request
 *       500:
 *         description: Restore failed
 */
router.post('/restore', async (req, res) => {
    try {
        const { filename, confirm } = req.body;
        
        if (!confirm) {
            return res.status(400).json({
                error: 'Confirmation required',
                message: 'Restore operations require explicit confirmation'
            });
        }
        
        if (!filename) {
            return res.status(400).json({
                error: 'Filename required',
                message: 'Please specify a backup filename to restore from'
            });
        }
        
        // Security: Only allow specific file extensions and no path traversal
        if (!/^[a-zA-Z0-9_-]+\.(tar\.gz|json)$/.test(filename)) {
            return res.status(400).json({
                error: 'Invalid filename',
                message: 'Only backup files are allowed'
            });
        }
        
        const backupPath = path.join(process.cwd(), 'backups', filename);
        
        // Check if backup file exists
        try {
            await fs.access(backupPath);
        } catch {
            return res.status(404).json({
                error: 'Backup not found',
                message: 'The specified backup file does not exist'
            });
        }
        
        logger.warn('Restore operation initiated', {
            filename,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            component: 'backup'
        });
        
        // For safety, we'll only provide restore instructions for now
        // In a real implementation, you'd implement the actual restore logic
        res.json({
            success: true,
            message: 'Restore instructions provided',
            instructions: [
                '1. Stop the application service',
                '2. Backup current data',
                `3. Extract backup: tar -xzf ${filename}`,
                '4. Copy restored files to appropriate locations',
                '5. Restart the application service',
                '6. Verify system functionality'
            ],
            warning: 'Restore operations should be performed manually for safety'
        });
        
    } catch (error) {
        logger.error('Restore operation failed', {
            error: error.message,
            filename: req.body.filename,
            ip: req.ip,
            component: 'backup'
        });
        
        res.status(500).json({
            error: 'Restore failed',
            message: process.env.NODE_ENV === 'production' ? 
                'Unable to perform restore' : error.message
        });
    }
});

module.exports = router;