import { supabase } from '../supabaseClient';

// Utility to get client information
const getClientInfo = () => {
  return {
    user_agent: navigator.userAgent,
    page_url: window.location.href,
    referrer: document.referrer,
    screen_resolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    cookie_enabled: navigator.cookieEnabled,
    online: navigator.onLine,
    timestamp: new Date().toISOString()
  };
};

// Utility to get IP address (you may need to implement this based on your backend)
const getIPAddress = async () => {
  try {
    // You can use a service like ipify.org or implement this in your backend
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not fetch IP address:', error);
    return null;
  }
};

// Generate unique session ID
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Get or create session ID
let sessionId = localStorage.getItem('session_id');
if (!sessionId) {
  sessionId = generateSessionId();
  localStorage.setItem('session_id', sessionId);
}

// Main logging class
class ActivityLogger {
  constructor() {
    this.sessionId = sessionId;
    this.startTime = Date.now();
    this.pageStartTime = Date.now();
    this.currentPage = window.location.pathname;
    
    // Track page visibility changes
    this.setupPageVisibilityTracking();
    
    // Track page unload
    this.setupPageUnloadTracking();
    
    // Track navigation
    this.setupNavigationTracking();
  }

  setupPageVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logPageTimeSpent();
      } else {
        this.pageStartTime = Date.now();
      }
    });
  }

  setupPageUnloadTracking() {
    window.addEventListener('beforeunload', () => {
      this.logPageTimeSpent();
    });
  }

  setupNavigationTracking() {
    // Track initial page load
    this.logPageNavigation();
    
    // Track route changes (for React Router)
    if (window.history && window.history.pushState) {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = (...args) => {
        originalPushState.apply(window.history, args);
        this.handleRouteChange();
      };
      
      window.history.replaceState = (...args) => {
        originalReplaceState.apply(window.history, args);
        this.handleRouteChange();
      };
    }
  }

  handleRouteChange() {
    this.logPageTimeSpent();
    this.currentPage = window.location.pathname;
    this.pageStartTime = Date.now();
    this.logPageNavigation();
  }

  logPageTimeSpent() {
    const timeSpent = Math.floor((Date.now() - this.pageStartTime) / 1000);
    if (timeSpent > 0) {
      this.updatePageNavigationTime(timeSpent);
    }
  }

  async updatePageNavigationTime(timeSpent) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_page_navigation', {
          p_user_id: user.id,
          p_page_path: this.currentPage,
          p_page_title: document.title,
          p_referrer: document.referrer,
          p_time_spent_seconds: timeSpent,
          p_session_id: this.sessionId,
          p_ip_address: await getIPAddress(),
          p_user_agent: navigator.userAgent
        });
      }
    } catch (error) {
      console.warn('Failed to update page navigation time:', error);
    }
  }

  async logPageNavigation() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_page_navigation', {
          p_user_id: user.id,
          p_page_path: this.currentPage,
          p_page_title: document.title,
          p_referrer: document.referrer,
          p_session_id: this.sessionId,
          p_ip_address: await getIPAddress(),
          p_user_agent: navigator.userAgent
        });
      }
    } catch (error) {
      console.warn('Failed to log page navigation:', error);
    }
  }

  // Log user activity
  async logActivity(activityType, activityDetails = null, metadata = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const clientInfo = getClientInfo();
        
        await supabase.rpc('log_user_activity', {
          p_user_id: user.id,
          p_activity_type: activityType,
          p_activity_details: activityDetails,
          p_ip_address: await getIPAddress(),
          p_user_agent: navigator.userAgent,
          p_session_id: this.sessionId,
          p_page_url: window.location.href,
          p_metadata: { ...clientInfo, ...metadata }
        });
      }
    } catch (error) {
      console.warn('Failed to log user activity:', error);
    }
  }

  // Log authentication events
  async logAuthEvent(eventType, eventDetails = null, success = true, errorMessage = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_auth_event', {
          p_user_id: user.id,
          p_event_type: eventType,
          p_event_details: eventDetails,
          p_ip_address: await getIPAddress(),
          p_user_agent: navigator.userAgent,
          p_success: success,
          p_error_message: errorMessage
        });
      }
    } catch (error) {
      console.warn('Failed to log auth event:', error);
    }
  }

  // Log form submissions
  async logFormSubmission(formName, formData, submissionSuccess = true, validationErrors = null, processingTimeMs = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_form_submission', {
          p_user_id: user.id,
          p_form_name: formName,
          p_form_data: formData,
          p_submission_success: submissionSuccess,
          p_validation_errors: validationErrors,
          p_processing_time_ms: processingTimeMs,
          p_ip_address: await getIPAddress(),
          p_user_agent: navigator.userAgent
        });
      }
    } catch (error) {
      console.warn('Failed to log form submission:', error);
    }
  }

  // Log errors
  async logError(errorType, errorMessage, errorStack = null, errorContext = null, severity = 'medium') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_error', {
          p_user_id: user.id,
          p_error_type: errorType,
          p_error_message: errorMessage,
          p_error_stack: errorStack,
          p_error_context: errorContext,
          p_page_url: window.location.href,
          p_user_agent: navigator.userAgent,
          p_ip_address: await getIPAddress(),
          p_severity: severity
        });
      }
    } catch (error) {
      console.warn('Failed to log error:', error);
    }
  }

  // Log data changes
  async logDataChange(tableName, recordId, changeType, oldValues = null, newValues = null, changeReason = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_data_change', {
          p_user_id: user.id,
          p_table_name: tableName,
          p_record_id: recordId,
          p_change_type: changeType,
          p_old_values: oldValues,
          p_new_values: newValues,
          p_change_reason: changeReason,
          p_ip_address: await getIPAddress(),
          p_user_agent: navigator.userAgent
        });
      }
    } catch (error) {
      console.warn('Failed to log data change:', error);
    }
  }

  // Log system actions (admin actions, etc.)
  async logSystemAction(actionType, actionDetails = null, affectedRecords = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_system_action', {
          p_user_id: user.id,
          p_action_type: actionType,
          p_action_details: actionDetails,
          p_affected_records: affectedRecords,
          p_ip_address: await getIPAddress(),
          p_user_agent: navigator.userAgent
        });
      }
    } catch (error) {
      console.warn('Failed to log system action:', error);
    }
  }

  // Start session tracking
  async startSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Log session start
        await this.logActivity('session_start', {
          session_id: this.sessionId,
          start_time: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('Failed to start session tracking:', error);
    }
  }

  // End session tracking
  async endSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const sessionDuration = Math.floor((Date.now() - this.startTime) / 1000);
        
        await this.logActivity('session_end', {
          session_id: this.sessionId,
          session_duration_seconds: sessionDuration,
          end_time: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('Failed to end session tracking:', error);
    }
  }

  // Track specific user actions
  async trackUserAction(action, details = null) {
    await this.logActivity(`user_action_${action}`, details);
  }

  // Track exam-related activities
  async trackExamActivity(action, examId, details = null) {
    await this.logActivity(`exam_${action}`, {
      exam_id: examId,
      ...details
    });
  }

  // Track notification activities
  async trackNotificationActivity(action, notificationId, details = null) {
    await this.logActivity(`notification_${action}`, {
      notification_id: notificationId,
      ...details
    });
  }

  // Track profile activities
  async trackProfileActivity(action, details = null) {
    await this.logActivity(`profile_${action}`, details);
  }

  // Track admin activities
  async trackAdminActivity(action, details = null) {
    await this.logActivity(`admin_${action}`, details);
  }
}

// Create singleton instance
const activityLogger = new ActivityLogger();

// Export the logger instance and utility functions
export default activityLogger;

// Export individual logging functions for convenience
export const {
  logActivity,
  logAuthEvent,
  logFormSubmission,
  logError,
  logDataChange,
  logSystemAction,
  trackUserAction,
  trackExamActivity,
  trackNotificationActivity,
  trackProfileActivity,
  trackAdminActivity,
  startSession,
  endSession
} = activityLogger;

// Export utility functions
export { getClientInfo, getIPAddress, generateSessionId };

// Auto-start session tracking when the module is imported
if (typeof window !== 'undefined') {
  // Start session tracking after a short delay to ensure auth is ready
  setTimeout(() => {
    activityLogger.startSession();
  }, 1000);
}
