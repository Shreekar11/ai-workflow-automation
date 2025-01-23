CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    clerk_user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AvailableAction" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AvailableTrigger" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Workflow" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_id TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL DEFAULT 'Untitled',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(id)
);

CREATE TABLE "Trigger" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID UNIQUE NOT NULL,
    trigger_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES "Workflow"(id),
    FOREIGN KEY (trigger_id) REFERENCES "AvailableTrigger"(id)
);

CREATE TABLE "Action" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    action_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    sorting_order INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES "Workflow"(id),
    FOREIGN KEY (action_id) REFERENCES "AvailableAction"(id)
);

CREATE TABLE "WorkflowRun" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    metadata JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES "Workflow"(id)
);

CREATE TABLE "WorkflowRunOutbox" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_run_id UUID UNIQUE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workflow_run_id) REFERENCES "WorkflowRun"(id)
);