#!/bin/bash

# Autonomous monitoring script for Domjuan Bot System
# This script should be run via cron every 5 minutes

set -euo pipefail

# Configuration
HEALTH_URL="${HEALTH_URL:-http://localhost:3000/health}"
LOG_FILE="${LOG_FILE:-./logs/domjuan-monitor.log}"
WEBHOOK_URL="${WEBHOOK_URL:-}"
MAX_MEMORY_MB="${MAX_MEMORY_MB:-400}"
MAX_CPU_PERCENT="${MAX_CPU_PERCENT:-80}"
ALERT_COOLDOWN_FILE="/tmp/domjuan-alert-cooldown"
COOLDOWN_MINUTES=30

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Send webhook notification
send_alert() {
    local message="$1"
    local level="${2:-warning}"
    
    if [[ -n "$WEBHOOK_URL" ]]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"content\": \"🚨 **Domjuan Bot System Alert**\n$message\"}" \
            --silent --show-error || log "Failed to send webhook alert"
    fi
    
    log "ALERT [$level]: $message"
}

# Check if we're in cooldown period
check_cooldown() {
    if [[ -f "$ALERT_COOLDOWN_FILE" ]]; then
        local last_alert=$(cat "$ALERT_COOLDOWN_FILE")
        local current_time=$(date +%s)
        local cooldown_seconds=$((COOLDOWN_MINUTES * 60))
        
        if (( current_time - last_alert < cooldown_seconds )); then
            return 0  # Still in cooldown
        fi
    fi
    return 1  # Not in cooldown
}

# Set alert cooldown
set_cooldown() {
    date +%s > "$ALERT_COOLDOWN_FILE"
}

# Health check
check_health() {
    log "Performing health check..."
    
    if ! response=$(curl -s -f --max-time 10 "$HEALTH_URL" 2>/dev/null); then
        if ! check_cooldown; then
            send_alert "Health check failed - service may be down!" "critical"
            set_cooldown
        fi
        return 1
    fi
    
    # Parse health response
    local status=$(echo "$response" | jq -r '.status // "unknown"' 2>/dev/null || echo "unknown")
    
    if [[ "$status" != "healthy" ]]; then
        if ! check_cooldown; then
            send_alert "System status is $status - bots may be failing!" "warning"
            set_cooldown
        fi
        return 1
    fi
    
    log "Health check passed - system is healthy"
    return 0
}

# Resource monitoring
check_resources() {
    log "Checking resource usage..."
    
    # Check memory usage
    if command -v pgrep >/dev/null && command -v ps >/dev/null; then
        local node_pids=$(pgrep -f "node.*server.js" || echo "")
        
        if [[ -n "$node_pids" ]]; then
            local memory_usage=0
            local cpu_usage=0
            
            for pid in $node_pids; do
                if [[ -f "/proc/$pid/status" ]]; then
                    local mem_kb=$(grep VmRSS "/proc/$pid/status" | awk '{print $2}' || echo "0")
                    memory_usage=$((memory_usage + mem_kb / 1024))
                fi
                
                local cpu_info=$(ps -p "$pid" -o %cpu --no-headers 2>/dev/null || echo "0")
                cpu_usage=$(echo "$cpu_usage + $cpu_info" | bc -l 2>/dev/null || echo "$cpu_usage")
            done
            
            # Check memory threshold
            if (( memory_usage > MAX_MEMORY_MB )); then
                if ! check_cooldown; then
                    send_alert "High memory usage: ${memory_usage}MB (threshold: ${MAX_MEMORY_MB}MB)" "warning"
                    set_cooldown
                fi
            fi
            
            # Check CPU threshold (basic check)
            if (( $(echo "$cpu_usage > $MAX_CPU_PERCENT" | bc -l 2>/dev/null || echo 0) )); then
                if ! check_cooldown; then
                    send_alert "High CPU usage: ${cpu_usage}% (threshold: ${MAX_CPU_PERCENT}%)" "warning"
                    set_cooldown
                fi
            fi
            
            log "Resource usage - Memory: ${memory_usage}MB, CPU: ${cpu_usage}%"
        else
            log "No Node.js processes found - service may be down"
            return 1
        fi
    fi
    
    return 0
}

# Disk space check
check_disk_space() {
    local data_dir="${DATA_DIR:-./data}"
    local min_free_mb="${MIN_FREE_DISK_MB:-100}"
    
    if [[ -d "$data_dir" ]]; then
        local free_space_kb=$(df "$data_dir" | tail -1 | awk '{print $4}')
        local free_space_mb=$((free_space_kb / 1024))
        
        if (( free_space_mb < min_free_mb )); then
            if ! check_cooldown; then
                send_alert "Low disk space: ${free_space_mb}MB free (minimum: ${min_free_mb}MB)" "warning"
                set_cooldown
            fi
            return 1
        fi
        
        log "Disk space check passed - ${free_space_mb}MB free"
    fi
    
    return 0
}

# Main monitoring function
main() {
    log "Starting automated monitoring check..."
    
    local issues=0
    
    # Perform checks
    check_health || ((issues++))
    check_resources || ((issues++))
    check_disk_space || ((issues++))
    
    if (( issues == 0 )); then
        log "All checks passed - system is healthy"
        # Remove cooldown file if everything is healthy
        [[ -f "$ALERT_COOLDOWN_FILE" ]] && rm -f "$ALERT_COOLDOWN_FILE"
    else
        log "Found $issues issues during monitoring"
    fi
    
    log "Monitoring check completed"
}

# Run main function
main "$@"