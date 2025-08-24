import React, { useState } from 'react';
import { 
  useActivityLogger, 
  useFormLogger, 
  useErrorLogger, 
  useExamLogger, 
  useNotificationLogger 
} from '../hooks/useActivityLogger';

/**
 * Example component demonstrating comprehensive logging usage
 * This shows how to implement logging in various scenarios
 */
export default function LoggingExample() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [activeTab, setActiveTab] = useState('basic');

  // Initialize all logging hooks
  const { 
    logUserAction, 
    logActivity, 
    logDataChange, 
    logSystemAction,
    startSession,
    endSession 
  } = useActivityLogger();

  const { logFormStart, logFormSuccess, logFormError } = useFormLogger('example_form');
  const { logValidationError, logDatabaseError, logSystemError } = useErrorLogger();
  const { logExamCreate, logExamUpdate, logExamView } = useExamLogger();
  const { logNotificationSend, logNotificationRead } = useNotificationLogger();

  // Example: Basic user action logging
  const handleButtonClick = (buttonName) => {
    logUserAction('button_click', { 
      button_name: buttonName, 
      context: 'logging_example',
      timestamp: new Date().toISOString()
    });
  };

  // Example: Form logging
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    logFormStart();
    const startTime = Date.now();
    
    try {
      // Simulate form processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate form data
      if (!formData.name || !formData.email) {
        const errors = [];
        if (!formData.name) errors.push('Name is required');
        if (!formData.email) errors.push('Email is required');
        
        const processingTime = Date.now() - startTime;
        logFormError(formData, errors, processingTime);
        logValidationError('Form validation failed', { 
          form_data: formData, 
          errors: errors 
        });
        return;
      }
      
      // Simulate successful submission
      const processingTime = Date.now() - startTime;
      logFormSuccess(formData, processingTime);
      
      // Log data change
      logDataChange('example_data', 'new-record-id', 'insert', null, formData, 'User submitted example form');
      
      alert('Form submitted successfully!');
      setFormData({ name: '', email: '' });
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logFormError(formData, [error.message], processingTime);
      logSystemError('Form submission failed', error.stack, { 
        form_data: formData,
        component: 'LoggingExample' 
      });
    }
  };

  // Example: Error logging
  const simulateError = (errorType) => {
    switch (errorType) {
      case 'validation':
        logValidationError('Invalid input format', { 
          field: 'email', 
          value: 'invalid-email',
          context: 'example_validation' 
        });
        break;
      case 'database':
        const dbError = new Error('Connection timeout');
        logDatabaseError('Database connection failed', dbError.stack, { 
          table: 'users', 
          operation: 'select',
          retry_count: 3 
        });
        break;
      case 'system':
        const sysError = new Error('Memory allocation failed');
        logSystemError('System resource error', sysError.stack, { 
          component: 'LoggingExample',
          action: 'memory_allocation',
          severity: 'critical' 
        });
        break;
      default:
        break;
    }
  };

  // Example: Exam activity logging
  const handleExamActions = (action, examId) => {
    const examData = { 
      name: 'Sample Exam', 
      subject: 'Mathematics',
      duration: '2 hours' 
    };
    
    switch (action) {
      case 'create':
        logExamCreate(examId, examData);
        break;
      case 'update':
        const oldData = { ...examData, duration: '1 hour' };
        logExamUpdate(examId, oldData, examData);
        break;
      case 'view':
        logExamView(examId);
        break;
      default:
        break;
    }
  };

  // Example: Notification logging
  const handleNotificationActions = (action, notificationId) => {
    switch (action) {
      case 'send':
        logNotificationSend(notificationId, 'user-123', 'Welcome to our platform!');
        break;
      case 'read':
        logNotificationRead(notificationId);
        break;
      default:
        break;
    }
  };

  // Example: System action logging
  const handleSystemAction = (actionType) => {
    logSystemAction(actionType, {
      action_performed: actionType,
      timestamp: new Date().toISOString(),
      user_context: 'admin_user'
    }, {
      affected_tables: ['users', 'profiles'],
      records_count: 150
    });
  };

  // Example: Custom activity logging
  const logCustomActivity = () => {
    logActivity('custom_event', {
      event_name: 'user_interaction',
      interaction_type: 'demo_click',
      metadata: {
        demo_version: '1.0.0',
        user_preferences: { theme: 'dark', language: 'en' }
      }
    });
  };

  // Example: Session management
  const handleSessionActions = (action) => {
    if (action === 'start') {
      startSession();
    } else if (action === 'end') {
      endSession();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Logging System Examples</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6">
        {['basic', 'forms', 'errors', 'exams', 'notifications', 'system'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              logUserAction('tab_change', { from: activeTab, to: tab });
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Basic Logging Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Basic Activity Logging</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleButtonClick('primary')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Log Button Click
            </button>
            
            <button
              onClick={logCustomActivity}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Log Custom Activity
            </button>
            
            <button
              onClick={() => handleSessionActions('start')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Start Session
            </button>
            
            <button
              onClick={() => handleSessionActions('end')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              End Session
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            These actions will be logged to the database. Check the browser console for any logging errors.
          </p>
        </div>
      )}

      {/* Forms Tab */}
      {activeTab === 'forms' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Form Logging Examples</h2>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Submit Form (with logging)
            </button>
          </form>
          
          <p className="text-sm text-gray-600">
            This form demonstrates form submission logging, validation error logging, and success logging.
          </p>
        </div>
      )}

      {/* Errors Tab */}
      {activeTab === 'errors' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Error Logging Examples</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => simulateError('validation')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Log Validation Error
            </button>
            
            <button
              onClick={() => simulateError('database')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Log Database Error
            </button>
            
            <button
              onClick={() => simulateError('system')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Log System Error
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            These buttons simulate different types of errors and log them with appropriate severity levels.
          </p>
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Exam Activity Logging</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleExamActions('create', 'exam-123')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Log Exam Create
            </button>
            
            <button
              onClick={() => handleExamActions('update', 'exam-123')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Log Exam Update
            </button>
            
            <button
              onClick={() => handleExamActions('view', 'exam-123')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Log Exam View
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            These actions demonstrate exam-related activity logging with different action types.
          </p>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Notification Activity Logging</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleNotificationActions('send', 'notif-123')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Log Notification Send
            </button>
            
            <button
              onClick={() => handleNotificationActions('read', 'notif-123')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Log Notification Read
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            These actions demonstrate notification-related activity logging.
          </p>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">System Action Logging</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSystemAction('bulk_update')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Log Bulk Update
            </button>
            
            <button
              onClick={() => handleSystemAction('data_export')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Log Data Export
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            These actions demonstrate system-level action logging for administrative operations.
          </p>
        </div>
      )}

      {/* Status Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Logging Status</h3>
        <p className="text-sm text-gray-600">
          All actions above are being logged to your Supabase database. Check the browser console for any logging errors.
          You can view the logs in your Supabase dashboard under the logging tables.
        </p>
      </div>
    </div>
  );
}
