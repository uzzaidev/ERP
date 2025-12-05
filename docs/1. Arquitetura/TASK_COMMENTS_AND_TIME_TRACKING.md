# Task Comments & Time Tracking API

This document describes the API endpoints for task comments and time tracking features added in Sprint 4.

## Overview

Sprint 4 adds two new features to task management:
1. **Task Comments** - Allow users to comment on tasks with support for @mentions
2. **Time Tracking** - Allow users to log time spent on tasks

Both features follow multi-tenant architecture and enforce proper tenant isolation.

---

## Task Comments API

### GET /api/tasks/[id]/comments

Retrieve all comments for a specific task.

**Authentication:** Required  
**Tenant Isolation:** Enforced

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "author_id": "uuid",
      "content": "This is a comment",
      "mentions": ["user-id-1", "user-id-2"],
      "created_at": "2025-12-05T10:00:00Z",
      "updated_at": "2025-12-05T10:00:00Z",
      "author": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

#### Error Responses

- `404` - Task not found or access denied
- `401` - Not authenticated
- `500` - Server error

---

### POST /api/tasks/[id]/comments

Create a new comment on a task.

**Authentication:** Required  
**Tenant Isolation:** Enforced

#### Request Body

```json
{
  "content": "This is my comment",
  "mentions": ["user-id-1", "user-id-2"]
}
```

#### Fields

- `content` (string, required): The comment text (min 1 character)
- `mentions` (array, optional): Array of user IDs mentioned in the comment

#### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "task_id": "uuid",
    "author_id": "uuid",
    "content": "This is my comment",
    "mentions": ["user-id-1"],
    "created_at": "2025-12-05T12:00:00Z",
    "updated_at": "2025-12-05T12:00:00Z",
    "author": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "avatar_url": null
    }
  }
}
```

#### Error Responses

- `400` - Content is required or invalid
- `404` - Task not found or access denied
- `401` - Not authenticated
- `500` - Server error

---

## Time Tracking API

### GET /api/tasks/[id]/time-logs

Retrieve all time log entries for a specific task.

**Authentication:** Required  
**Tenant Isolation:** Enforced

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "user_id": "uuid",
      "hours": 4.5,
      "description": "Working on feature implementation",
      "logged_date": "2025-12-05",
      "created_at": "2025-12-05T10:00:00Z",
      "user": {
        "id": "uuid",
        "full_name": "Jane Smith",
        "email": "jane@example.com",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

#### Error Responses

- `404` - Task not found or access denied
- `401` - Not authenticated
- `500` - Server error

---

### POST /api/tasks/[id]/time-logs

Create a new time log entry for a task.

**Authentication:** Required  
**Tenant Isolation:** Enforced

#### Request Body

```json
{
  "hours": 3.5,
  "description": "Bug fixing and testing",
  "logged_date": "2025-12-05"
}
```

#### Fields

- `hours` (number, required): Hours spent (0.5 - 24.0)
- `description` (string, optional): Description of work done
- `logged_date` (string, optional): Date of work (YYYY-MM-DD). Defaults to today

#### Validation

- Hours must be greater than 0
- Hours cannot exceed 24 per entry
- Logged date cannot be in the future

#### Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "task_id": "uuid",
    "user_id": "uuid",
    "hours": 3.5,
    "description": "Bug fixing and testing",
    "logged_date": "2025-12-05",
    "created_at": "2025-12-05T12:00:00Z",
    "user": {
      "id": "uuid",
      "full_name": "Jane Smith",
      "email": "jane@example.com",
      "avatar_url": null
    }
  }
}
```

#### Side Effects

- Automatically updates the task's `completed_hours` field
- Triggers the database function `update_task_completed_hours()`

#### Error Responses

- `400` - Invalid hours value (≤0 or >24)
- `404` - Task not found or access denied
- `401` - Not authenticated
- `500` - Server error

---

## Database Schema

### task_comments

```sql
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mentions UUID[], -- Array of user IDs mentioned
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### task_time_logs

```sql
CREATE TABLE task_time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hours DECIMAL(10,2) NOT NULL,
    description TEXT,
    logged_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Function

The system includes an automatic trigger that updates `tasks.completed_hours` whenever time logs are added, updated, or deleted:

```sql
CREATE OR REPLACE FUNCTION update_task_completed_hours(p_task_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tasks
  SET completed_hours = (
    SELECT COALESCE(SUM(hours), 0)
    FROM task_time_logs
    WHERE task_id = p_task_id
  )
  WHERE id = p_task_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Frontend Components

### TaskComments

React component for displaying and adding comments to a task.

**Location:** `src/components/tasks/TaskComments.tsx`

**Usage:**
```tsx
import { TaskComments } from '@/components/tasks';

<TaskComments taskId={taskId} />
```

**Features:**
- Display all comments with author info
- Add new comments
- Relative time display (e.g., "5m ago", "2h ago")
- Real-time updates
- @mentions support (placeholder for future implementation)

### TimeLogEntry

React component for logging time and viewing time entries.

**Location:** `src/components/tasks/TimeLogEntry.tsx`

**Usage:**
```tsx
import { TimeLogEntry } from '@/components/tasks';

<TimeLogEntry 
  taskId={taskId} 
  onTimeLogged={(totalHours) => console.log(totalHours)}
/>
```

**Features:**
- Display all time log entries
- Add new time logs with validation
- Calculate and display total hours
- Collapsible form
- Date picker with max date validation

### Integration

Both components are integrated into the `EditTaskModal` component:

```tsx
{taskId && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <TaskComments taskId={taskId} />
    <TimeLogEntry taskId={taskId} />
  </div>
)}
```

---

## Testing

### API Tests

- **Comments API**: 6 tests covering GET/POST operations
- **Time Logs API**: 8 tests covering GET/POST with validation

**Run tests:**
```bash
pnpm test task-comments
pnpm test task-time-logs
```

### Test Coverage

- Multi-tenant isolation
- Authentication requirements
- Input validation
- Error handling
- Database interactions

---

## Security Considerations

1. **Tenant Isolation**: All queries filter by `tenant_id`
2. **Authentication**: All endpoints require valid user session
3. **Authorization**: Users can only access tasks within their tenant
4. **Input Validation**: 
   - Comment content must not be empty
   - Hours must be between 0 and 24
   - Date cannot be in the future
5. **SQL Injection**: Parameterized queries via Supabase client

---

## Future Enhancements

1. **@Mentions**: 
   - Parse content for @username patterns
   - Create notifications for mentioned users
   - Highlight mentions in UI

2. **Comment Editing**:
   - Allow authors to edit their comments
   - Track edit history

3. **Time Log Editing**:
   - Allow users to edit/delete their time logs
   - Require approval for logs older than X days

4. **Rich Text**:
   - Support markdown in comments
   - Add file attachments

5. **Time Tracking Analytics**:
   - Time spent per user/task/project
   - Burndown charts based on logged time
   - Compare estimated vs actual hours

---

## Migration Guide

To apply these changes to your database:

1. Run the existing migrations (if not already done):
   - `db/02_projects_and_tasks.sql` (includes table definitions)

2. Run the new function migration:
   - `db/13_task_time_tracking_functions.sql`

3. Verify the changes:
```sql
-- Check if tables exist
SELECT * FROM task_comments LIMIT 1;
SELECT * FROM task_time_logs LIMIT 1;

-- Check if function exists
SELECT proname FROM pg_proc WHERE proname = 'update_task_completed_hours';
```

---

**Last Updated**: 2025-12-05  
**Version**: 1.0  
**Sprint**: 4
