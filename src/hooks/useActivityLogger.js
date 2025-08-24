import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import activityLogger from '../utils/logger';

/**
 * React hook for comprehensive activity logging
 * Provides easy access to all logging functions and automatic page tracking
 */
export const useActivityLogger = () => {
  const location = useLocation();
  const pageStartTime = useRef(Date.now());
  const currentPage = useRef(location.pathname);

  // Track page changes
  useEffect(() => {
    const timeSpent = Math.floor((Date.now() - pageStartTime.current) / 1000);
    
    // Log time spent on previous page if more than 1 second
    if (timeSpent > 1 && currentPage.current !== location.pathname) {
      activityLogger.logActivity('page_time_spent', {
        page: currentPage.current,
        time_spent_seconds: timeSpent
      });
    }

    // Update current page and start time
    currentPage.current = location.pathname;
    pageStartTime.current = Date.now();

    // Log new page visit
    activityLogger.logActivity('page_visit', {
      page: location.pathname,
      page_title: document.title,
      referrer: document.referrer
    });
  }, [location.pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const timeSpent = Math.floor((Date.now() - pageStartTime.current) / 1000);
      if (timeSpent > 1) {
        activityLogger.logActivity('page_time_spent', {
          page: currentPage.current,
          time_spent_seconds: timeSpent
        });
      }
    };
  }, []);

  // Wrapper functions for common logging activities
  const logUserAction = useCallback((action, details = null) => {
    return activityLogger.trackUserAction(action, details);
  }, []);

  const logExamActivity = useCallback((action, examId, details = null) => {
    return activityLogger.trackExamActivity(action, examId, details);
  }, []);

  const logNotificationActivity = useCallback((action, notificationId, details = null) => {
    return activityLogger.trackNotificationActivity(action, notificationId, details);
  }, []);

  const logProfileActivity = useCallback((action, details = null) => {
    return activityLogger.trackProfileActivity(action, details);
  }, []);

  const logAdminActivity = useCallback((action, details = null) => {
    return activityLogger.trackAdminActivity(action, details);
  }, []);

  const logFormSubmission = useCallback((formName, formData, success = true, errors = null, processingTime = null) => {
    return activityLogger.logFormSubmission(formName, formData, success, errors, processingTime);
  }, []);

  const logError = useCallback((errorType, errorMessage, errorStack = null, context = null, severity = 'medium') => {
    return activityLogger.logError(errorType, errorMessage, errorStack, context, severity);
  }, []);

  const logDataChange = useCallback((tableName, recordId, changeType, oldValues = null, newValues = null, reason = null) => {
    return activityLogger.logDataChange(tableName, recordId, changeType, oldValues, newValues, reason);
  }, []);

  const logSystemAction = useCallback((actionType, details = null, affectedRecords = null) => {
    return activityLogger.logSystemAction(actionType, details, affectedRecords);
  }, []);

  const logAuthEvent = useCallback((eventType, details = null, success = true, errorMessage = null) => {
    return activityLogger.logAuthEvent(eventType, details, success, errorMessage);
  }, []);

  const startSession = useCallback(() => {
    return activityLogger.startSession();
  }, []);

  const endSession = useCallback(() => {
    return activityLogger.endSession();
  }, []);

  return {
    // Core logging functions
    logActivity: activityLogger.logActivity.bind(activityLogger),
    logUserAction,
    logExamActivity,
    logNotificationActivity,
    logProfileActivity,
    logAdminActivity,
    logFormSubmission,
    logError,
    logDataChange,
    logSystemAction,
    logAuthEvent,
    
    // Session management
    startSession,
    endSession,
    
    // Utility functions
    getClientInfo: activityLogger.getClientInfo?.bind(activityLogger),
    
    // Current page info
    currentPage: currentPage.current,
    pageStartTime: pageStartTime.current
  };
};

/**
 * Hook specifically for form logging
 */
export const useFormLogger = (formName) => {
  const { logFormSubmission } = useActivityLogger();

  const logFormStart = useCallback(() => {
    return logFormSubmission(formName, {}, false, null, null);
  }, [formName, logFormSubmission]);

  const logFormSuccess = useCallback((formData, processingTime = null) => {
    return logFormSubmission(formName, formData, true, null, processingTime);
  }, [formName, logFormSubmission]);

  const logFormError = useCallback((formData, errors, processingTime = null) => {
    return logFormSubmission(formName, formData, false, errors, processingTime);
  }, [formName, logFormSubmission]);

  return {
    logFormStart,
    logFormSuccess,
    logFormError
  };
};

/**
 * Hook specifically for error logging
 */
export const useErrorLogger = () => {
  const { logError } = useActivityLogger();

  const logValidationError = useCallback((message, context = null) => {
    return logError('validation_error', message, null, context, 'low');
  }, [logError]);

  const logDatabaseError = useCallback((message, stack = null, context = null) => {
    return logError('database_error', message, stack, context, 'high');
  }, [logError]);

  const logAuthError = useCallback((message, context = null) => {
    return logError('auth_error', message, null, context, 'medium');
  }, [logError]);

  const logSystemError = useCallback((message, stack = null, context = null) => {
    return logError('system_error', message, stack, context, 'critical');
  }, [logError]);

  return {
    logValidationError,
    logDatabaseError,
    logAuthError,
    logSystemError,
    logError
  };
};

/**
 * Hook specifically for exam activity logging
 */
export const useExamLogger = () => {
  const { logExamActivity } = useActivityLogger();

  const logExamCreate = useCallback((examId, examData) => {
    return logExamActivity('create', examId, examData);
  }, [logExamActivity]);

  const logExamUpdate = useCallback((examId, oldData, newData) => {
    return logExamActivity('update', examId, { old_data: oldData, new_data: newData });
  }, [logExamActivity]);

  const logExamDelete = useCallback((examId, examData) => {
    return logExamActivity('delete', examId, examData);
  }, [logExamActivity]);

  const logExamView = useCallback((examId) => {
    return logExamActivity('view', examId);
  }, [logExamActivity]);

  const logExamStatusChange = useCallback((examId, oldStatus, newStatus) => {
    return logExamActivity('status_change', examId, { old_status: oldStatus, new_status: newStatus });
  }, [logExamActivity]);

  return {
    logExamCreate,
    logExamUpdate,
    logExamDelete,
    logExamView,
    logExamStatusChange
  };
};

/**
 * Hook specifically for notification activity logging
 */
export const useNotificationLogger = () => {
  const { logNotificationActivity } = useActivityLogger();

  const logNotificationSend = useCallback((notificationId, recipientId, content) => {
    return logNotificationActivity('send', notificationId, { recipient_id: recipientId, content });
  }, [logNotificationActivity]);

  const logNotificationRead = useCallback((notificationId) => {
    return logNotificationActivity('read', notificationId);
  }, [logNotificationActivity]);

  const logNotificationRespond = useCallback((notificationId, response) => {
    return logNotificationActivity('respond', notificationId, { response });
  }, [logNotificationActivity]);

  const logNotificationDelete = useCallback((notificationId) => {
    return logNotificationActivity('delete', notificationId);
  }, [logNotificationActivity]);

  return {
    logNotificationSend,
    logNotificationRead,
    logNotificationRespond,
    logNotificationDelete
  };
};

export default useActivityLogger;
