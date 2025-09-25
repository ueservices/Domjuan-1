#!/bin/bash

# Automated backup script for Domjuan Bot System
# This script should be run via cron daily

set -euo pipefail

# Configuration
DATA_DIR="${DATA_DIR:-./data}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
WEBHOOK_URL="${WEBHOOK_URL:-}"
COMPRESS="${COMPRESS:-true}"

# Logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] BACKUP: $1"
}

# Send notification
send_notification() {
    local message="$1"
    local level="${2:-info}"
    
    if [[ -n "$WEBHOOK_URL" ]]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"content\": \"💾 **Domjuan Backup System**\n$message\"}" \
            --silent --show-error || log "Failed to send webhook notification"
    fi
    
    log "$message"
}

# Create backup
create_backup() {
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_name="domjuan_backup_$timestamp"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log "Creating backup: $backup_name"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$backup_path"
    
    # Copy data files
    if [[ -d "$DATA_DIR" ]]; then
        cp -r "$DATA_DIR" "$backup_path/"
        log "Data directory backed up"
    else
        log "Warning: Data directory $DATA_DIR not found"
    fi
    
    # Copy configuration files
    for config_file in package.json ecosystem.config.js docker-compose.yml .env; do
        if [[ -f "$config_file" ]]; then
            cp "$config_file" "$backup_path/"
        fi
    done
    
    # Create metadata file
    cat > "$backup_path/backup_metadata.json" <<EOF
{
    "timestamp": "$(date -Iseconds)",
    "version": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "data_size": "$(du -sh $DATA_DIR 2>/dev/null | cut -f1 || echo 'unknown')",
    "backup_type": "automated",
    "retention_until": "$(date -d "+$RETENTION_DAYS days" -Iseconds)"
}
EOF
    
    # Compress backup if enabled
    if [[ "$COMPRESS" == "true" ]]; then
        log "Compressing backup..."
        tar -czf "${backup_path}.tar.gz" -C "$BACKUP_DIR" "$backup_name"
        rm -rf "$backup_path"
        backup_path="${backup_path}.tar.gz"
        log "Backup compressed: $(basename $backup_path)"
    fi
    
    local backup_size=$(du -sh "$backup_path" | cut -f1)
    send_notification "✅ Backup created successfully: $(basename $backup_path) ($backup_size)" "success"
    
    return 0
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days"
    
    local deleted_count=0
    
    if [[ -d "$BACKUP_DIR" ]]; then
        # Find and delete old backups
        while IFS= read -r -d '' backup_file; do
            if [[ -f "$backup_file" ]] && [[ $(find "$backup_file" -mtime +$RETENTION_DAYS 2>/dev/null) ]]; then
                rm -f "$backup_file"
                log "Deleted old backup: $(basename $backup_file)"
                ((deleted_count++))
            elif [[ -d "$backup_file" ]] && [[ $(find "$backup_file" -mtime +$RETENTION_DAYS 2>/dev/null) ]]; then
                rm -rf "$backup_file"
                log "Deleted old backup directory: $(basename $backup_file)"
                ((deleted_count++))
            fi
        done < <(find "$BACKUP_DIR" -name "domjuan_backup_*" -print0 2>/dev/null)
    fi
    
    if (( deleted_count > 0 )); then
        log "Cleanup completed: $deleted_count old backups removed"
    else
        log "No old backups to clean up"
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_path="$1"
    
    if [[ "$backup_path" == *.tar.gz ]]; then
        if tar -tzf "$backup_path" >/dev/null 2>&1; then
            log "Backup integrity verified: $(basename $backup_path)"
            return 0
        else
            log "ERROR: Backup integrity check failed: $(basename $backup_path)"
            return 1
        fi
    elif [[ -d "$backup_path" ]]; then
        if [[ -f "$backup_path/backup_metadata.json" ]]; then
            log "Backup integrity verified: $(basename $backup_path)"
            return 0
        else
            log "ERROR: Backup missing metadata: $(basename $backup_path)"
            return 1
        fi
    fi
    
    return 1
}

# Export current bot data via API
export_current_data() {
    local api_url="${API_URL:-http://localhost:3000}"
    local export_dir="$BACKUP_DIR/exports/$(date '+%Y%m%d')"
    
    mkdir -p "$export_dir"
    
    # Try to export via API if service is running
    if curl -s -f "$api_url/health" >/dev/null 2>&1; then
        log "Exporting current data via API..."
        
        # Export JSON
        if curl -s -f "$api_url/api/export/json" -o "$export_dir/current_export.json"; then
            log "JSON export completed"
        else
            log "Warning: JSON export failed"
        fi
        
        # Export CSV
        if curl -s -f "$api_url/api/export/csv" -o "$export_dir/current_export.csv"; then
            log "CSV export completed"
        else
            log "Warning: CSV export failed"
        fi
    else
        log "Service not running - skipping API export"
    fi
}

# Main backup function
main() {
    log "Starting automated backup process..."
    
    local success=true
    
    # Export current data if service is running
    export_current_data || true
    
    # Create backup
    if create_backup; then
        # Find the most recent backup for verification
        local latest_backup=$(find "$BACKUP_DIR" -name "domjuan_backup_*" -type f -o -name "domjuan_backup_*" -type d | sort | tail -1)
        
        if [[ -n "$latest_backup" ]] && verify_backup "$latest_backup"; then
            log "Backup verification successful"
        else
            log "ERROR: Backup verification failed"
            success=false
        fi
    else
        log "ERROR: Backup creation failed"
        success=false
    fi
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Report status
    if [[ "$success" == "true" ]]; then
        log "Backup process completed successfully"
    else
        send_notification "❌ Backup process failed - manual intervention required" "error"
        exit 1
    fi
}

# Run main function
main "$@"