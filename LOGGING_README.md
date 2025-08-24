# Comprehensive User Activity Logging System

This document explains how to use the comprehensive logging system that tracks all user activities in your Hand2Write application.

## 🗄️ Database Schema

The logging system creates the following tables in your Supabase database:

### Core Tables
- **`user_activity_log`** - Tracks all user interactions and activities
- **`auth_events_log`** - Logs authentication events (login, logout, registration)
- **`page_navigation_log`** - Tracks page visits and time spent
- **`form_submission_log`** - Logs all form submissions with validation results
- **`error_log`** - Tracks errors and issues with severity levels
- **`system_actions_log`** - Logs admin and system-level actions
- **`data_change_log`** - Tracks all data modifications (insert, update, delete)
- **`session_log`** - Manages user sessions and duration

### Enhanced Existing Tables
- **`profiles`** - Added `created_at` and `updated_at` timestamps
- **`exam_info`** - Added `updated_at` timestamp
- **`notifications`** - Added `updated_at` timestamp

## 🚀 Quick Start

### 1. Run the Database Schema

Copy and run the entire `supabase_schema.sql` file in your Supabase SQL editor. This will:
- Create all logging tables
- Set up indexes for performance
- Create logging functions
- Enable Row Level Security (RLS)
- Set up automatic triggers

### 2. Import the Logger in Your Components

```jsx
import { useActivityLogger } from '../hooks/useActivityLogger';

function MyComponent() {
  const { logUserAction, logError, logFormSubmission } = useActivityLogger();
  
  // Use logging functions...
}
```

## 📝 Usage Examples

### Basic Activity Logging

```jsx
import { useActivityLogger } from '../hooks/useActivityLogger';

function MyComponent() {
  const { logUserAction, logError } = useActivityLogger();
  
  const handleButtonClick = () => {
    logUserAction('button_click', { button_name: 'submit', context: 'form' });
  };
  
  const handleError = (error) => {
    logError('validation_error', error.message, error.stack, { context: 'form_validation' });
  };
}
```

### Form Logging

```jsx
import { useFormLogger } from '../hooks/useActivityLogger';

function RegistrationForm() {
  const { logFormStart, logFormSuccess, logFormError } = useFormLogger('user_registration');
  
  const handleSubmit = async (formData) => {
    logFormStart(); // Log form submission start
    const startTime = Date.now();
    
    try {
      // Process form...
      const processingTime = Date.now() - startTime;
      logFormSuccess(formData, processingTime); // Log successful submission
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logFormError(formData, [error.message], processingTime); // Log errors
    }
  };
}
```

### Exam Activity Logging

```jsx
import { useExamLogger } from '../hooks/useActivityLogger';

function ExamComponent() {
  const { logExamCreate, logExamUpdate, logExamView } = useExamLogger();
  
  const handleExamCreate = (examData) => {
    logExamCreate(examId, examData);
  };
  
  const handleExamUpdate = (examId, oldData, newData) => {
    logExamUpdate(examId, oldData, newData);
  };
  
  const handleExamView = (examId) => {
    logExamView(examId);
  };
}
```

### Error Logging

```jsx
import { useErrorLogger } from '../hooks/useActivityLogger';

function MyComponent() {
  const { logValidationError, logDatabaseError, logSystemError } = useErrorLogger();
  
  const handleValidationError = (message) => {
    logValidationError(message, { field: 'email', value: email });
  };
  
  const handleDatabaseError = (error) => {
    logDatabaseError(error.message, error.stack, { table: 'profiles', operation: 'insert' });
  };
  
  const handleSystemError = (error) => {
    logSystemError(error.message, error.stack, { component: 'MyComponent', action: 'data_fetch' });
  };
}
```

### Notification Logging

```jsx
import { useNotificationLogger } from '../hooks/useActivityLogger';

function NotificationComponent() {
  const { logNotificationSend, logNotificationRead } = useNotificationLogger();
  
  const handleSendNotification = (notificationId, recipientId, content) => {
    logNotificationSend(notificationId, recipientId, content);
  };
  
  const handleReadNotification = (notificationId) => {
    logNotificationRead(notificationId);
  };
}
```

## 🔧 Available Logging Functions

### Core Functions
- `logActivity(activityType, details, metadata)` - Log any user activity
- `logAuthEvent(eventType, details, success, errorMessage)` - Log authentication events
- `logFormSubmission(formName, formData, success, errors, processingTime)` - Log form submissions
- `logError(errorType, message, stack, context, severity)` - Log errors
- `logDataChange(tableName, recordId, changeType, oldValues, newValues, reason)` - Log data changes
- `logSystemAction(actionType, details, affectedRecords)` - Log system actions

### Specialized Functions
- `trackUserAction(action, details)` - Track user-specific actions
- `trackExamActivity(action, examId, details)` - Track exam-related activities
- `trackNotificationActivity(action, notificationId, details)` - Track notification activities
- `trackProfileActivity(action, details)` - Track profile-related activities
- `trackAdminActivity(action, details)` - Track admin actions

### Session Management
- `startSession()` - Start session tracking
- `endSession()` - End session tracking

## 📊 What Gets Logged Automatically

### Page Navigation
- Page visits and time spent
- Route changes
- Page visibility changes
- Session duration

### Client Information
- User agent (browser/device info)
- IP address
- Screen resolution
- Timezone and language
- Platform information

### Form Interactions
- Form submission attempts
- Validation errors
- Processing time
- Success/failure status

### Error Tracking
- Validation errors
- Database errors
- Authentication errors
- System errors
- Error context and stack traces

## 🎯 Best Practices

### 1. Use Appropriate Log Levels
- **Low**: Validation errors, user input issues
- **Medium**: Authentication errors, form submission issues
- **High**: Database errors, API failures
- **Critical**: System crashes, security issues

### 2. Include Relevant Context
```jsx
logError('validation_error', 'Invalid email format', null, {
  field: 'email',
  value: email,
  form: 'registration',
  user_id: userId
});
```

### 3. Don't Log Sensitive Information
- Never log passwords, tokens, or personal data
- Use placeholders for sensitive fields
- Consider data privacy regulations

### 4. Performance Considerations
- Logging is asynchronous and won't block UI
- Use appropriate log levels to avoid excessive logging
- Monitor database performance with large log volumes

## 🔍 Querying Logs

### Recent User Activities
```sql
SELECT * FROM user_activity_log 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC 
LIMIT 50;
```

### Error Analysis
```sql
SELECT error_type, COUNT(*) as count, 
       AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/3600) as hours_ago
FROM error_log 
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_type 
ORDER BY count DESC;
```

### Page Performance
```sql
SELECT page_path, 
       AVG(time_spent_seconds) as avg_time,
       COUNT(*) as visits
FROM page_navigation_log 
WHERE time_spent_seconds IS NOT NULL
GROUP BY page_path 
ORDER BY avg_time DESC;
```

### Form Success Rates
```sql
SELECT form_name, 
       COUNT(*) as total_submissions,
       SUM(CASE WHEN submission_success THEN 1 ELSE 0 END) as successful,
       AVG(processing_time_ms) as avg_processing_time
FROM form_submission_log 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY form_name;
```

## 🚨 Troubleshooting

### Common Issues

1. **Logging Functions Not Working**
   - Check if Supabase RPC functions are created
   - Verify database permissions
   - Check browser console for errors

2. **Performance Issues**
   - Monitor database query performance
   - Consider archiving old logs
   - Use appropriate indexes

3. **Missing Data**
   - Verify user authentication state
   - Check if user ID is available
   - Ensure proper error handling

### Debug Mode
Enable debug logging by checking the browser console for warnings about failed logging operations.

## 📈 Analytics and Insights

The logging system provides rich data for:

- **User Behavior Analysis**: Track how users navigate your app
- **Performance Monitoring**: Identify slow forms and pages
- **Error Tracking**: Monitor and fix issues proactively
- **User Journey Mapping**: Understand user workflows
- **Security Monitoring**: Track suspicious activities
- **Business Intelligence**: Analyze user engagement patterns

## 🔐 Security Considerations

- All logs are protected by Row Level Security (RLS)
- Users can only see their own activity logs
- Admin users can access system-wide logs
- Sensitive information is automatically filtered
- Logs are retained according to your data retention policy

## 📞 Support

For issues with the logging system:
1. Check the browser console for errors
2. Verify database schema is properly applied
3. Check Supabase logs for RPC function errors
4. Ensure proper authentication setup

---

This logging system provides comprehensive visibility into user activities while maintaining performance and security. Use it to build better user experiences and maintain system reliability.
