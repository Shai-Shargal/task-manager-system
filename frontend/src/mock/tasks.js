/**
 * Initial task list — mirrors db/seed.sql (13 tasks).
 */

export const INITIAL_TASKS = [
  {
    task_id: 1,
    title: 'Refactor authentication middleware',
    description:
      'Consolidate JWT validation and session refresh logic into a shared middleware module to reduce duplication across Express routes.',
    assigned_to: 1,
    status: 'Done',
    due_date: '2026-04-28T17:00:00.000Z',
    created_at: '2026-04-01T10:00:00.000Z',
  },
  {
    task_id: 2,
    title: 'Write API integration tests for employee endpoints',
    description:
      'Add automated coverage for GET /employees and error paths using the mssql driver and mocked stored procedure responses.',
    assigned_to: 1,
    status: 'In Progress',
    due_date: '2026-05-30T17:00:00.000Z',
    created_at: '2026-05-08T09:30:00.000Z',
  },
  {
    task_id: 3,
    title: 'Migrate legacy reports to Power BI',
    description:
      'Port three departmental Excel reports into a shared Power BI workspace with row-level security aligned to department membership.',
    assigned_to: 2,
    status: 'Pending',
    due_date: '2026-05-05T17:00:00.000Z',
    created_at: '2026-04-15T11:00:00.000Z',
  },
  {
    task_id: 4,
    title: 'Resolve production login timeout incidents',
    description:
      'Investigate intermittent 30-second timeouts on the SSO callback; capture APM traces and propose connection pool tuning.',
    assigned_to: 2,
    status: 'In Progress',
    due_date: '2026-05-10T12:00:00.000Z',
    created_at: '2026-05-01T08:00:00.000Z',
  },
  {
    task_id: 5,
    title: 'Implement task dashboard caching layer',
    description:
      'Design a Redis cache for employee task summary aggregates with a five-minute TTL and invalidation on task status updates.',
    assigned_to: 2,
    status: 'Pending',
    due_date: '2026-06-20T17:00:00.000Z',
    created_at: '2026-05-12T14:00:00.000Z',
  },
  {
    task_id: 6,
    title: 'Review pull requests for payments microservice',
    description:
      'Complete code review for the v2 settlement API changes, focusing on idempotency keys and transaction boundary handling.',
    assigned_to: 2,
    status: 'In Progress',
    due_date: '2026-06-05T17:00:00.000Z',
    created_at: '2026-05-14T16:30:00.000Z',
  },
  {
    task_id: 7,
    title: 'Update dependency security scan pipeline',
    description:
      'Integrate npm audit and Snyk gates into CI so critical vulnerabilities block merges to the main branch.',
    assigned_to: 2,
    status: 'Pending',
    due_date: '2026-05-08T17:00:00.000Z',
    created_at: '2026-04-20T10:15:00.000Z',
  },
  {
    task_id: 8,
    title: 'Document CI/CD rollback procedure',
    description:
      'Publish a runbook for blue-green rollback including database migration reversal steps and communication templates.',
    assigned_to: 3,
    status: 'Pending',
    due_date: '2026-06-12T17:00:00.000Z',
    created_at: '2026-05-10T13:00:00.000Z',
  },
  {
    task_id: 9,
    title: 'Finalize container base image hardening checklist',
    description:
      'Apply CIS Docker benchmarks to the MSSQL and Node images used in local development and document exceptions.',
    assigned_to: 3,
    status: 'Done',
    due_date: '2026-04-15T17:00:00.000Z',
    created_at: '2026-03-22T09:00:00.000Z',
  },
  {
    task_id: 10,
    title: 'Launch Q2 employer brand social campaign',
    description:
      'Coordinate LinkedIn and Instagram content calendar, creative assets, and UTM tracking for recruitment landing pages.',
    assigned_to: 4,
    status: 'In Progress',
    due_date: '2026-05-12T17:00:00.000Z',
    created_at: '2026-04-25T10:00:00.000Z',
  },
  {
    task_id: 11,
    title: 'Prepare brand guidelines presentation for leadership',
    description:
      'Draft a 20-slide deck covering typography, tone of voice, and logo usage for the annual town hall.',
    assigned_to: 4,
    status: 'Pending',
    due_date: '2026-06-18T17:00:00.000Z',
    created_at: '2026-05-15T11:30:00.000Z',
  },
  {
    task_id: 12,
    title: 'Schedule annual compliance training sessions',
    description:
      'Book facilitator-led sessions for all departments and send calendar invites with pre-read materials.',
    assigned_to: 6,
    status: 'Pending',
    due_date: '2026-05-01T17:00:00.000Z',
    created_at: '2026-04-10T08:30:00.000Z',
  },
  {
    task_id: 13,
    title: 'Compile monthly marketing KPI dashboard',
    description:
      'Aggregate campaign impressions, click-through rates, and cost-per-lead metrics into a single executive summary spreadsheet.',
    assigned_to: 5,
    status: 'Done',
    due_date: '2026-04-30T17:00:00.000Z',
    created_at: '2026-04-01T09:00:00.000Z',
  },
];
