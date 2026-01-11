<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">PRD Story Sync</h1>
      <p class="mt-2 text-sm text-gray-600">
        Sync story tickets from PRD documents to JIRA
      </p>
    </div>

    <!-- Input Form -->
    <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
      <div class="space-y-6">
        <!-- Epic Key Input -->
        <div>
          <label for="epic-key" class="block text-sm font-medium text-gray-700">
            Epic Key (Optional)
          </label>
          <input
            id="epic-key"
            v-model="epicKey"
            type="text"
            placeholder="e.g., EPIC-123"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @keyup.enter="handleSync"
          />
          <p class="mt-1 text-xs text-gray-500">
            If provided, PRD URL will be read from epic's PRD custom field
          </p>
        </div>

        <!-- PRD URL Input -->
        <div>
          <label for="prd-url" class="block text-sm font-medium text-gray-700">
            PRD URL (Optional)
          </label>
          <input
            id="prd-url"
            v-model="prdUrl"
            type="text"
            placeholder="https://example.atlassian.net/wiki/spaces/PROJ/pages/123456789/PRD"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            @keyup.enter="handleSync"
          />
          <p class="mt-1 text-xs text-gray-500">
            Required if epic_key is not provided
          </p>
        </div>

        <!-- Options -->
        <div class="space-y-3">
          <div class="flex items-center">
            <input
              id="dry-run"
              v-model="dryRun"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="dry-run" class="ml-2 block text-sm text-gray-900">
              Preview mode (dry run) - No JIRA updates
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="async-mode"
              v-model="asyncMode"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="async-mode" class="ml-2 block text-sm text-gray-900">
              Run in background (for long-running operations)
            </label>
          </div>
        </div>

        <!-- Existing Ticket Action -->
        <div>
          <label for="existing-ticket-action" class="block text-sm font-medium text-gray-700">
            Existing Ticket Action
          </label>
          <select
            id="existing-ticket-action"
            v-model="existingTicketAction"
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="skip">Skip (don't create)</option>
            <option value="update">Update existing</option>
            <option value="error">Return error</option>
          </select>
          <p class="mt-1 text-xs text-gray-500">
            Action to take when story ticket already exists
          </p>
        </div>

        <!-- Sync Button -->
        <div>
          <button
            @click="handleSync"
            :disabled="(!epicKey && !prdUrl) || loading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
            <span v-else>Sync Stories from PRD</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Job Status (when async mode) -->
    <div v-if="jobId && !response" class="mb-6">
      <JobStatusCard
        :job="jobStatus"
        :is-loading="isPolling"
        :is-cancelling="isCancelling"
        :show-auto-refresh-info="true"
        @cancel="handleCancelJob"
        @refresh="refreshJob"
      />
    </div>

    <!-- Sample PRD Format -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-medium text-gray-900">Expected PRD Format</h2>
        <button
          @click="showSamplePRD = !showSamplePRD"
          class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <span>{{ showSamplePRD ? 'Hide' : 'Show' }} Sample</span>
          <svg
            class="ml-1 h-4 w-4 transition-transform"
            :class="{ 'rotate-180': showSamplePRD }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <p class="text-sm text-gray-600 mb-4">
        Your PRD document should contain a table under a "User Stories" header with the following columns:
      </p>
      <div v-if="showSamplePRD" class="mt-4">
        <h3 class="text-base font-semibold text-gray-900 mb-3">User Stories</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 border border-gray-300 bg-white">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  User Story
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  Importance
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  Mockup / Technical Notes
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-300">
                  Acceptance Criteria
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr>
                <td class="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                  <div class="font-medium mb-1">Integrate to Quota Management API</div>
                  <div class="text-gray-600 text-xs">
                    As a Voice Call Backend<br/>
                    I want to integrate with Quota Management API<br/>
                    So that billing is accurately recording all deductions
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                  High
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                  API endpoint: /api/v1/quota/deduct<br/>
                  Authentication: Bearer token required
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                  <ul class="list-disc list-inside space-y-1">
                    <li>API call succeeds with valid credentials</li>
                    <li>Quota deduction is recorded in billing system</li>
                    <li>Error handling for invalid requests</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td class="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                  <div class="font-medium mb-1">User Authentication Flow</div>
                  <div class="text-gray-600 text-xs">
                    As a System User<br/>
                    I want to authenticate using OAuth 2.0<br/>
                    So that my account is securely accessed
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                  Critical
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                  OAuth 2.0 flow diagram available in design docs<br/>
                  Support for refresh tokens
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                  <ul class="list-disc list-inside space-y-1">
                    <li>User can log in with valid credentials</li>
                    <li>Access token expires after 1 hour</li>
                    <li>Refresh token can be used to obtain new access token</li>
                    <li>Invalid credentials return appropriate error</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 p-3 bg-blue-100 rounded text-xs text-blue-800">
          <strong>Note:</strong> The PRD Sync will extract stories from tables with this structure. 
          Each row in the table will be converted into a JIRA story ticket with the user story format, 
          acceptance criteria, and any mockup/technical notes included in the description.
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="response" class="space-y-6">
      <!-- Summary Stats -->
      <div v-if="response.summary_stats" class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Summary</h2>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div v-for="(value, key) in response.summary_stats" :key="key" class="text-center">
            <div class="text-2xl font-bold text-indigo-600">{{ value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ formatKey(key) }}</div>
          </div>
        </div>
        <div class="mt-4 text-sm text-gray-600">
          <p>Execution time: {{ response.execution_time_seconds.toFixed(2) }}s</p>
          <p>Operation mode: {{ response.operation_mode }}</p>
        </div>
      </div>

      <!-- Created Tickets -->
      <div v-if="response.created_tickets && Object.keys(response.created_tickets).length > 0" class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Created Tickets</h2>
        <div v-for="(tickets, type) in response.created_tickets" :key="String(type)" class="mb-3">
          <h3 class="text-sm font-medium text-gray-700 mb-2">{{ formatKey(String(type)) }}:</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="ticket in tickets"
              :key="ticket"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {{ ticket }}
            </span>
          </div>
        </div>
      </div>

      <!-- Story Details -->
      <div v-if="stories.length > 0" class="bg-white shadow-sm rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Story Details</h2>
          <div class="flex items-center space-x-3">
            <div class="text-sm text-gray-600">
              <span class="font-medium">{{ stories.length }}</span> story/stories
              <span v-if="response?.operation_mode === 'planning' || response?.operation_mode === 'dry_run'" class="ml-2 text-yellow-600">
                ({{ response.operation_mode }} mode)
              </span>
            </div>
            <button
              @click="handleAddStory"
              class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Story
            </button>
          </div>
        </div>
        <div class="space-y-4">
          <div
            v-for="(story, index) in stories"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
          >
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1">
                <h3 class="text-base font-medium text-gray-900">{{ story.summary }}</h3>
              </div>
              <div class="flex items-center space-x-2 ml-4 flex-wrap gap-2">
                <!-- JIRA Key with metadata -->
                <div v-if="story.jira_key" class="flex items-center space-x-1">
                  <a
                    v-if="getJiraUrl(story)"
                    :href="getJiraUrl(story)!"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer"
                    :title="`Open ${story.jira_key} in JIRA`"
                  >
                    {{ story.jira_key }}
                    <svg class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    :title="`JIRA URL not available for ${story.jira_key}`"
                  >
                    {{ story.jira_key }}
                  </span>
                  <!-- Ticket Source Badge -->
                  <span
                    v-if="story.ticket_source"
                    :class="{
                      'bg-blue-100 text-blue-800': story.ticket_source === 'prd_table',
                      'bg-purple-100 text-purple-800': story.ticket_source === 'jira_api',
                      'bg-green-100 text-green-800': story.ticket_source === 'newly_created',
                    }"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :title="getTicketSourceTooltip(story.ticket_source)"
                  >
                    {{ getTicketSourceLabel(story.ticket_source) }}
                  </span>
                  <!-- Action Taken Badge -->
                  <span
                    v-if="story.action_taken"
                    :class="{
                      'bg-green-100 text-green-800': story.action_taken === 'created',
                      'bg-yellow-100 text-yellow-800': story.action_taken === 'updated',
                      'bg-gray-100 text-gray-800': story.action_taken === 'skipped',
                    }"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  >
                    {{ story.action_taken === 'created' ? 'Created' : story.action_taken === 'updated' ? 'Updated' : 'Skipped' }}
                  </span>
                  <!-- Was Updated Indicator -->
                  <span
                    v-if="story.was_updated"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"
                    title="This ticket was updated during sync"
                  >
                    Synced
                  </span>
                </div>
                <!-- PRD Row UUID (for debugging/transparency) - only shown when JIRA key is not available -->
                <span
                  v-if="story.prd_row_uuid && !story.jira_key"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono bg-gray-100 text-gray-600"
                  :title="`PRD Row UUID: ${story.prd_row_uuid}`"
                >
                  UUID
                </span>
                <button
                  v-if="!story.jira_key"
                  @click="handleCreateStory(index)"
                  :disabled="loading || !epicKey"
                  class="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  title="Create in JIRA"
                >
                  <LoadingSpinner v-if="creatingStoryIndex === index" size="sm" color="white" class="mr-1" />
                  <svg v-else class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create
                </button>
                <button
                  @click="handleEditStory(index)"
                  class="text-indigo-600 hover:text-indigo-800"
                  title="Edit story"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="handleRemoveStory(index)"
                  class="text-red-600 hover:text-red-800"
                  title="Remove story"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="prose prose-sm max-w-none mb-4">
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ story.description }}</p>
            </div>

            <!-- Acceptance Criteria -->
            <div v-if="story.acceptance_criteria && story.acceptance_criteria.length > 0" class="mb-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Acceptance Criteria</h4>
              <ul class="list-disc list-inside space-y-1">
                <li v-for="(criteria, idx) in story.acceptance_criteria" :key="idx" class="text-sm text-gray-600">
                  {{ criteria }}
                </li>
              </ul>
            </div>

            <!-- Test Cases -->
            <div v-if="story.test_cases && story.test_cases.length > 0" class="mb-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Test Cases</h4>
              <div class="space-y-2">
                <div
                  v-for="(testCase, idx) in story.test_cases"
                  :key="idx"
                  class="border border-gray-200 rounded p-2"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-900">{{ testCase.title }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {{ testCase.type }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-600">{{ testCase.description }}</p>
                  <p class="text-xs text-gray-500 mt-1">Expected: {{ testCase.expected_result }}</p>
                </div>
              </div>
            </div>

            <!-- Tasks -->
            <div v-if="story.tasks && story.tasks.length > 0" class="mt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Tasks</h4>
              <div class="space-y-2">
                <div
                  v-for="(task, idx) in story.tasks"
                  :key="idx"
                  class="border-l-4 border-indigo-500 pl-3 py-1"
                >
                  <p class="text-sm font-medium text-gray-900">{{ task.summary }}</p>
                  <p class="text-xs text-gray-600">{{ task.team }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="stories.length > 0" class="mt-6 flex space-x-3">
          <button
            @click="handleCreateAll"
            :disabled="storiesWithoutJiraKey.length === 0 || loading"
            class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="loading" size="sm" color="white" class="mr-2" />
            <span v-else>Create All in JIRA ({{ storiesWithoutJiraKey.length }})</span>
          </button>
          <button
            @click="handleBulkUpdate"
            :disabled="storiesWithJiraKey.length === 0 || loading || bulkUpdating"
            class="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="bulkUpdating" size="sm" color="white" class="mr-2" />
            <span v-else>Update All in JIRA ({{ storiesWithJiraKey.length }})</span>
          </button>
        </div>
      </div>

      <!-- Task Details (if separate from stories) -->
      <div v-if="response.task_details && response.task_details.length > 0" class="bg-white shadow-sm rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Task Details</h2>
        <div class="space-y-4">
          <div
            v-for="(task, index) in response.task_details"
            :key="index"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-base font-medium text-gray-900">{{ task.summary }}</h3>
              <span
                v-if="task.jira_key"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {{ task.jira_key }}
              </span>
            </div>
            <p v-if="task.description" class="text-sm text-gray-600 mb-2">{{ task.description }}</p>
            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span class="text-gray-500">Team:</span>
                <span class="ml-1 text-gray-900">{{ task.team }}</span>
              </div>
              <div>
                <span class="text-gray-500">Estimated Days:</span>
                <span class="ml-1 text-gray-900">{{ task.estimated_days }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Errors -->
      <div v-if="response.errors && response.errors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-red-800 mb-2">Errors</h3>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(error, index) in response.errors" :key="index" class="text-sm text-red-700">
            {{ error }}
          </li>
        </ul>
      </div>

      <!-- Warnings -->
      <div v-if="response.warnings && response.warnings.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 class="text-sm font-medium text-yellow-800 mb-2">Warnings</h3>
        <ul class="list-disc list-inside space-y-1">
          <li v-for="(warning, index) in response.warnings" :key="index" class="text-sm text-yellow-700">
            {{ warning }}
          </li>
        </ul>
      </div>

      <!-- Prompt Viewer -->
      <PromptViewer
        :system-prompt="response.system_prompt || undefined"
        :user-prompt="response.user_prompt || undefined"
        :llm-provider="response.llm_provider || undefined"
        :llm-model="response.llm_model || undefined"
        @test-prompt="handleTestPrompt"
      />
    </div>

    <!-- A/B Testing Modal -->
    <PromptResubmitModal
      v-if="showABTestModal"
      operation-type="plan_tasks"
      :original-request="{
        epic_key: epicKey || null,
        prd_url: prdUrl || null,
        dry_run: dryRun,
        async_mode: asyncMode,
        existing_ticket_action: existingTicketAction,
      }"
      :original-system-prompt="response?.system_prompt || undefined"
      :original-user-prompt="response?.user_prompt || ''"
      :original-result="response"
      @close="showABTestModal = false"
      @result="handleABTestResult"
    />

    <!-- Story Edit Modal -->
    <StoryEditModal
      v-if="showEditModal"
      :story="editingStoryIndex !== null ? stories[editingStoryIndex] : undefined"
      :story-index="editingStoryIndex ?? undefined"
      :default-epic-key="epicKey"
      @close="handleCloseEdit"
      @save="handleSaveStory"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUIStore } from '../stores/ui';
import { syncStoriesFromPRD, getJobStatus, updateStoryTicket, bulkUpdateStories, bulkCreateStories, createStoryTicket } from '../api/endpoints';
import type { PRDStorySyncResponse, BatchResponse, StoryDetail, StoryUpdateItem, BulkUpdateStoriesResponse, BulkCreateStoriesResponse } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import PromptViewer from '../components/PromptViewer.vue';
import PromptResubmitModal from '../components/PromptResubmitModal.vue';
import JobStatusCard from '../components/JobStatusCard.vue';
import StoryEditModal from '../components/StoryEditModal.vue';
import { useJobPolling } from '../composables/useJobPolling';
import { useJobUrl } from '../composables/useJobUrl';
import { log, error as logError } from '../utils/logger';
import { isAsyncResponse, getCreatedTicketKeys, handleDuplicateJob } from '../utils/jobHelpers';

const route = useRoute();
const uiStore = useUIStore();

const epicKey = ref('');
const prdUrl = ref('');
const dryRun = ref(true);
const asyncMode = ref(true);
const existingTicketAction = ref<'skip' | 'update' | 'error'>('skip');
const loading = ref(false);
const response = ref<PRDStorySyncResponse | null>(null);
const stories = ref<StoryDetail[]>([]);
const showABTestModal = ref(false);
const showEditModal = ref(false);
const showSamplePRD = ref(false);
const editingStoryIndex = ref<number | null>(null);
const creatingStoryIndex = ref<number | null>(null);
const bulkUpdating = ref(false);

// Use useJobUrl for job ID management
const { jobId, setJobId: setJobIdInUrl, removeFromUrl: removeJobIdFromUrl } = useJobUrl('jobId');

// Computed property for stories with JIRA keys
const storiesWithJiraKey = computed(() => {
  return stories.value.filter(s => s.jira_key);
});

// Computed property for stories without JIRA keys
const storiesWithoutJiraKey = computed(() => {
  return stories.value.filter(s => !s.jira_key);
});

// Job polling
const { job: jobStatus, isPolling, isCancelling, startPolling, cancelJob: cancelJobPolling } = useJobPolling(
  jobId,
  {
    onComplete: async (job) => {
      if (job.results) {
        const results = job.results as any;
        
        // Check if this is a BulkCreateStoriesResponse (from bulkCreateStories)
        if (results.total_stories !== undefined && results.results !== undefined) {
          const bulkResult = results as BulkCreateStoriesResponse;
          
          if (bulkResult.successful > 0) {
            // Update local story state with created ticket keys
            const storiesToCreate = stories.value.filter(s => !s.jira_key);
            bulkResult.results.forEach((r, idx) => {
              if (r.success && r.ticket_key && storiesToCreate[idx]) {
                const storyIndex = stories.value.findIndex(s => s.summary === storiesToCreate[idx].summary);
                if (storyIndex !== -1) {
                  stories.value[storyIndex].jira_key = r.ticket_key;
                }
              }
            });
            uiStore.showSuccess(`Successfully created ${bulkResult.successful} story/stories: ${bulkResult.created_tickets.join(', ')}`);
          }
          if (bulkResult.failed > 0) {
            uiStore.showError(`Failed to create ${bulkResult.failed} story/stories`);
          }
        }
        // Check if this is a bulk creation result (old format)
        else if (results.creation_results?.created_tickets) {
          const { stories: createdStoryKeys } = getCreatedTicketKeys(results);
          
          // Update local story state with jira_key values
          if (results.story_details && results.story_details.length > 0) {
            results.story_details.forEach((responseStory: StoryDetail) => {
              if (responseStory.jira_key) {
                const localStoryIndex = stories.value.findIndex(s => 
                  s.summary === responseStory.summary || 
                  (!s.jira_key && responseStory.jira_key)
                );
                if (localStoryIndex !== -1) {
                  stories.value[localStoryIndex].jira_key = responseStory.jira_key;
                  stories.value[localStoryIndex].jira_url = responseStory.jira_url;
                }
              }
            });
          }
          
          if (createdStoryKeys.length > 0) {
            uiStore.showSuccess(`Successfully created ${createdStoryKeys.length} story/stories: ${createdStoryKeys.join(', ')}`);
          } else {
            uiStore.showWarning('Job completed but no stories were created');
          }
        } else {
          // This is a PRD sync result
          const prdResults = results as PRDStorySyncResponse;
          
          // Log for debugging
          log('Job completed, setting response:', {
            success: prdResults.success,
            storyCount: prdResults.story_details?.length || 0,
            hasStoryDetails: !!prdResults.story_details,
          });
          
          // Set response and wait for Vue to update
          response.value = prdResults;
          
          // Initialize stories array from response
          if (prdResults.story_details && prdResults.story_details.length > 0) {
            stories.value = prdResults.story_details.map(story => ({ ...story }));
          }
          
          await nextTick();
          
          if (prdResults.success) {
            const storyCount = prdResults.story_details?.length || 0;
            uiStore.showSuccess(`Sync complete: ${storyCount} story/stories processed`);
          } else {
            // Even if not successful, show the stories if they exist
            const storyCount = prdResults.story_details?.length || 0;
            if (storyCount > 0) {
              uiStore.showInfo(`Processed ${storyCount} story/stories (no tickets created)`);
            }
          }
        }
        // Don't clear job ID from URL - keep it for reference
        // Only clear the local ref to hide status card
        // Note: Form fields (epicKey, prdUrl, etc.) are preserved and NOT cleared
        jobId.value = null;
      }
    },
    onError: (err) => {
      logError('Job polling error:', err);
    },
  }
);

// Restore job from URL on mount
onMounted(async () => {
  // Prefill form from query params
  if (route.query.epicKey && typeof route.query.epicKey === 'string') {
    epicKey.value = route.query.epicKey;
  }
  if (route.query.prdUrl && typeof route.query.prdUrl === 'string') {
    prdUrl.value = route.query.prdUrl;
  }
  
  if (jobId.value) {
    try {
      const job = await getJobStatus(jobId.value);
      
      // Prefill form from job data if not already set from query params
      if (!epicKey.value && job.results && typeof job.results === 'object') {
        const results = job.results as any;
        if (results.epic_key) {
          epicKey.value = results.epic_key;
        }
      }
      // Prefill PRD URL from job data if not already set from query params
      if (!prdUrl.value && job.prd_url) {
        prdUrl.value = job.prd_url;
      }
      
      if (['started', 'processing'].includes(job.status)) {
        // Job is still active, start polling
        startPolling();
      } else if (job.status === 'completed' && job.results) {
        // Job is completed, restore results
        const results = job.results as any;
        
        // Handle different result types (same logic as onComplete)
        if (results.total_stories !== undefined && results.results !== undefined) {
          const bulkResult = results as BulkCreateStoriesResponse;
          if (bulkResult.successful > 0) {
            const storiesToCreate = stories.value.filter(s => !s.jira_key);
            bulkResult.results.forEach((r, idx) => {
              if (r.success && r.ticket_key && storiesToCreate[idx]) {
                const storyIndex = stories.value.findIndex(s => s.summary === storiesToCreate[idx].summary);
                if (storyIndex !== -1) {
                  stories.value[storyIndex].jira_key = r.ticket_key;
                }
              }
            });
            uiStore.showSuccess(`Successfully created ${bulkResult.successful} story/stories: ${bulkResult.created_tickets.join(', ')}`);
          }
        } else if (results.creation_results?.created_tickets) {
          const { stories: createdStoryKeys } = getCreatedTicketKeys(results);
          if (results.story_details && results.story_details.length > 0) {
            results.story_details.forEach((responseStory: StoryDetail) => {
              if (responseStory.jira_key) {
                const localStoryIndex = stories.value.findIndex(s => 
                  s.summary === responseStory.summary || 
                  (!s.jira_key && responseStory.jira_key)
                );
                if (localStoryIndex !== -1) {
                  stories.value[localStoryIndex].jira_key = responseStory.jira_key;
                  stories.value[localStoryIndex].jira_url = responseStory.jira_url;
                }
              }
            });
          }
          if (createdStoryKeys.length > 0) {
            uiStore.showSuccess(`Successfully created ${createdStoryKeys.length} story/stories: ${createdStoryKeys.join(', ')}`);
          }
        } else {
          // PRD sync result
          const prdResults = results as PRDStorySyncResponse;
          response.value = prdResults;
          if (prdResults.story_details && prdResults.story_details.length > 0) {
            stories.value = prdResults.story_details.map(story => ({ ...story }));
          }
          if (prdResults.success) {
            const storyCount = prdResults.story_details?.length || 0;
            uiStore.showSuccess(`Sync complete: ${storyCount} story/stories processed`);
          }
        }
        // Clear local ref to hide status card, but keep in URL
        // Note: Form fields (epicKey, prdUrl, etc.) are preserved and NOT cleared
        jobId.value = null;
      } else if (job.status === 'failed') {
        uiStore.showError(`Job failed: ${job.error || 'Unknown error'}`);
        jobId.value = null;
      } else if (job.status === 'cancelled') {
        uiStore.showInfo('Job was cancelled');
        jobId.value = null;
      }
    } catch (err: any) {
      logError('Error restoring job from URL:', err);
      uiStore.showError('Failed to restore job from URL');
      removeJobIdFromUrl();
    }
  }
});

async function handleSync() {
  if (!epicKey.value && !prdUrl.value) {
    uiStore.showError('Please provide either an Epic Key or PRD URL');
    return;
  }

  // Clear job ID from URL before starting new sync
  removeJobIdFromUrl();

  loading.value = true;
  response.value = null;
  stories.value = [];

  try {
    const result = await syncStoriesFromPRD({
      epic_key: epicKey.value || null,
      prd_url: prdUrl.value || null,
      dry_run: dryRun.value,
      async_mode: asyncMode.value,
      existing_ticket_action: existingTicketAction.value,
    });

    // Check if it's a BatchResponse (async mode)
    if ('job_id' in result) {
      const batchResponse = result as BatchResponse;
      setJobIdInUrl(batchResponse.job_id);
      uiStore.showInfo(`Job started: ${batchResponse.job_id}`);
      startPolling();
    } else if (result.success) {
      // Synchronous response
      response.value = result as PRDStorySyncResponse;
      
      // Initialize stories array from response
      if (result.story_details && result.story_details.length > 0) {
        stories.value = result.story_details.map(story => ({ ...story }));
      }
      
      const storyCount = result.story_details?.length || 0;
      uiStore.showSuccess(`Sync complete: ${storyCount} story/stories processed`);
    } else {
      uiStore.showError('Failed to sync stories from PRD');
    }
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to sync stories from PRD');
    logError('Error syncing stories:', error);
  } finally {
    loading.value = false;
  }
}

function handleTestPrompt() {
  showABTestModal.value = true;
}

function handleABTestResult(result: any) {
  uiStore.showInfo('A/B test completed');
}

function formatKey(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getJiraUrl(story: StoryDetail): string | null {
  // If jira_url is provided, use it
  if (story.jira_url) {
    return story.jira_url;
  }
  
  // If jira_key exists but no jira_url, try to construct it
  if (story.jira_key) {
    // Try to extract base URL from other stories that have jira_url
    const storyWithUrl = stories.value.find(s => s.jira_url && s.jira_key);
    if (storyWithUrl && storyWithUrl.jira_url) {
      try {
        const url = new URL(storyWithUrl.jira_url);
        // Extract base URL (e.g., https://domain.atlassian.net)
        const baseUrl = `${url.protocol}//${url.host}`;
        // Construct URL using standard JIRA browse pattern
        return `${baseUrl}/browse/${story.jira_key}`;
      } catch (e) {
        // If URL parsing fails, return null
        return null;
      }
    }
  }
  
  return null;
}

async function handleCancelJob() {
  if (!jobId.value) {
    return;
  }
  
  try {
    await cancelJobPolling();
    
    // Restore form fields from job data before removing from URL
    if (jobStatus.value) {
      // Restore epicKey from results if empty
      if (!epicKey.value && jobStatus.value.results && typeof jobStatus.value.results === 'object') {
        const results = jobStatus.value.results as any;
        if (results.epic_key) {
          epicKey.value = results.epic_key;
        }
      }
      
      // Restore prdUrl if empty
      if (!prdUrl.value && jobStatus.value.prd_url) {
        prdUrl.value = jobStatus.value.prd_url;
      }
    }
    
    // Only remove from URL if cancel was successful
    // The cancelJobPolling function handles the API call, status checks, and status updates
    removeJobIdFromUrl();
  } catch (err: any) {
    // Error is already handled in cancelJobPolling, but we don't remove from URL on error
    logError('Error cancelling job:', err);
  }
}

async function refreshJob() {
  if (jobId.value) {
    try {
      const job = await getJobStatus(jobId.value);
      if (job.status === 'completed' && job.results) {
        const results = job.results as PRDStorySyncResponse;
        
        // Log for debugging
        log('Refreshing job, setting response:', {
          success: results.success,
          storyCount: results.story_details?.length || 0,
          hasStoryDetails: !!results.story_details,
        });
        
        response.value = results;
        
        // Initialize stories array from response
        if (results.story_details && results.story_details.length > 0) {
          stories.value = results.story_details.map(story => ({ ...story }));
        }
        
        await nextTick();
        
        if (results.success) {
          const storyCount = results.story_details?.length || 0;
          uiStore.showSuccess(`Sync complete: ${storyCount} story/stories processed`);
        } else {
          // Even if not successful, show the stories if they exist
          const storyCount = results.story_details?.length || 0;
          if (storyCount > 0) {
            uiStore.showInfo(`Processed ${storyCount} story/stories (no tickets created)`);
          }
        }
        jobId.value = null;
      }
    } catch (error: any) {
      uiStore.showError('Failed to refresh job status');
    }
  }
}

async function handleViewJobResults() {
  if (jobStatus.value?.results) {
    const results = jobStatus.value.results as PRDStorySyncResponse;
    
    // Log for debugging
    log('Viewing job results:', {
      success: results.success,
      storyCount: results.story_details?.length || 0,
      hasStoryDetails: !!results.story_details,
    });
    
    response.value = results;
    
    // Initialize stories array from response
    if (results.story_details && results.story_details.length > 0) {
      stories.value = results.story_details.map(story => ({ ...story }));
    }
    
    if (results.success) {
      const storyCount = results.story_details?.length || 0;
      uiStore.showSuccess(`Sync complete: ${storyCount} story/stories processed`);
    } else {
      // Even if not successful, show the stories if they exist
      const storyCount = results.story_details?.length || 0;
      if (storyCount > 0) {
        uiStore.showInfo(`Processed ${storyCount} story/stories (no tickets created)`);
      }
    }
    jobId.value = null;
  }
}

function handleAddStory() {
  if (!epicKey.value) {
    uiStore.showError('Please enter epic key before adding stories');
    return;
  }
  editingStoryIndex.value = null;
  showEditModal.value = true;
}

function handleEditStory(index: number) {
  editingStoryIndex.value = index;
  showEditModal.value = true;
}

function handleCloseEdit() {
  showEditModal.value = false;
  editingStoryIndex.value = null;
}

async function handleSaveStory(updatedStory: StoryDetail, index?: number) {
  if (index !== undefined && index !== null) {
    // Update existing story
    const originalStory = stories.value[index];
    stories.value[index] = updatedStory;
    
    // If story has jira_key, offer to update in JIRA
    if (originalStory.jira_key && originalStory.jira_key === updatedStory.jira_key) {
      const shouldUpdate = confirm('This story exists in JIRA. Update it in JIRA as well?');
      if (shouldUpdate) {
        try {
          // Format test cases if present
          let testCasesText: string | undefined;
          if (updatedStory.test_cases && updatedStory.test_cases.length > 0) {
            testCasesText = updatedStory.test_cases.map((tc, idx) => {
              return `${idx + 1}. ${tc.title}\n   Type: ${tc.type}\n   Description: ${tc.description}\n   Expected: ${tc.expected_result}`;
            }).join('\n\n');
          }

          const result = await updateStoryTicket({
            story_key: originalStory.jira_key,
            summary: updatedStory.summary,
            description: updatedStory.description,
            test_cases: testCasesText,
            update_jira: true,
          });

          if (result.success && result.updated_in_jira) {
            uiStore.showSuccess(`Story updated successfully in JIRA: ${originalStory.jira_key}`);
          } else {
            uiStore.showWarning('Story saved locally, but JIRA update may have failed');
          }
        } catch (error: any) {
          const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
          uiStore.showError(`Failed to update story in JIRA: ${errorMsg}`);
          logError('Error updating story in JIRA:', error);
        }
      } else {
        uiStore.showSuccess('Story updated locally');
      }
    } else {
      uiStore.showSuccess('Story updated successfully');
    }
  } else {
    // Add new story
    stories.value.push(updatedStory);
    uiStore.showSuccess('Story added successfully');
  }
  handleCloseEdit();
}

function handleRemoveStory(index: number) {
  if (confirm('Remove this story?')) {
    stories.value.splice(index, 1);
    uiStore.showSuccess('Story removed');
  }
}

async function handleCreateStory(index: number) {
  const story = stories.value[index];
  
  if (!story) {
    uiStore.showError('Story not found');
    return;
  }

  if (story.jira_key) {
    uiStore.showInfo(`Story already created: ${story.jira_key}`);
    return;
  }

  if (!epicKey.value) {
    uiStore.showError('Epic key is required to create stories');
    return;
  }

  creatingStoryIndex.value = index;

  try {
    // Use description as-is (acceptance criteria are already included in description per API spec)
    const description = story.description || '';

    // Format test cases if present
    let testCasesText: string | undefined;
    if (story.test_cases && story.test_cases.length > 0) {
      testCasesText = story.test_cases.map((tc, idx) => {
        return `${idx + 1}. ${tc.title}\n   Type: ${tc.type}\n   Description: ${tc.description}\n   Expected: ${tc.expected_result}`;
      }).join('\n\n');
    }

    // Create the story ticket using the story-specific endpoint
    const result = await createStoryTicket({
      parent_key: epicKey.value,
      summary: story.summary,
      description: description,
      test_cases: testCasesText,
      prd_row_uuid: story.prd_row_uuid || undefined,
      create_ticket: true,
    });

    if (result.success && result.ticket_key) {
      // Update the story with the created key
      stories.value[index].jira_key = result.ticket_key;
      uiStore.showSuccess(`Successfully created story: ${result.ticket_key}`);
    } else {
      uiStore.showError(`Failed to create story: ${result.error || result.message || 'Unknown error'}`);
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
    uiStore.showError(`Failed to create story: ${errorMsg}`);
    logError('Error creating story:', error);
  } finally {
    creatingStoryIndex.value = null;
  }
}

async function handleCreateAll() {
  if (stories.value.length === 0) {
    uiStore.showError('No stories to create');
    return;
  }

  if (!epicKey.value) {
    uiStore.showError('Epic key is required');
    return;
  }

  // Get stories without JIRA keys
  const storiesToCreate = stories.value.filter(s => !s.jira_key);
  if (storiesToCreate.length === 0) {
    uiStore.showInfo('All stories already have JIRA keys');
    return;
  }

  loading.value = true;

  try {
    // Build bulk request from actual story data
    const bulkStories = storiesToCreate.map(story => {
      // Format test cases if present
      let testCasesText: string | null = null;
      if (story.test_cases && story.test_cases.length > 0) {
        testCasesText = story.test_cases.map((tc, idx) => {
          return `${idx + 1}. ${tc.title}\n   Type: ${tc.type}\n   Description: ${tc.description}\n   Expected: ${tc.expected_result}`;
        }).join('\n\n');
      }

      return {
        parent_key: epicKey.value,
        summary: story.summary,
        description: story.description || '',
        test_cases: testCasesText,
        prd_row_uuid: story.prd_row_uuid || undefined,
      };
    });

    const result = await bulkCreateStories({
      stories: bulkStories,
      create_tickets: true,
      async_mode: asyncMode.value,
    });

    // Check if it's a BatchResponse (async mode)
    if (isAsyncResponse(result)) {
      const batchResponse = result as BatchResponse;
      jobId.value = batchResponse.job_id;
      uiStore.showInfo(`Bulk creation job started: ${batchResponse.job_id}`);
      startPolling();
    } else {
      // Synchronous response
      const syncResult = result as BulkCreateStoriesResponse;

      if (syncResult.successful > 0) {
        // Update local story state with created ticket keys
        updateStoriesWithCreatedKeys(syncResult, storiesToCreate);
        uiStore.showSuccess(`Successfully created ${syncResult.successful} story/stories: ${syncResult.created_tickets.join(', ')}`);
      }
      if (syncResult.failed > 0) {
        uiStore.showError(`Failed to create ${syncResult.failed} story/stories`);
        // Log errors from individual results
        syncResult.results.filter(r => !r.success).forEach(r => {
          logError(`Story ${r.index} failed:`, r.error);
        });
      }
    }
  } catch (err: any) {
    // Handle 409 Conflict for duplicate jobs
    const duplicateJobId = handleDuplicateJob(err);
    if (duplicateJobId) {
      jobId.value = duplicateJobId;
      uiStore.showInfo(`Job already in progress: ${duplicateJobId}. Monitoring existing job.`);
      startPolling();
    } else {
      logError('Error creating stories:', err);
      uiStore.showError(err.response?.data?.detail || 'Failed to create stories');
    }
  } finally {
    loading.value = false;
  }
}

function updateStoriesWithCreatedKeys(result: BulkCreateStoriesResponse, storiesToCreate: StoryDetail[]) {
  // Update stories with their created ticket keys
  result.results.forEach((r, idx) => {
    if (r.success && r.ticket_key && storiesToCreate[idx]) {
      // Find the story in the main stories array by summary match
      const storyIndex = stories.value.findIndex(s => s.summary === storiesToCreate[idx].summary);
      if (storyIndex !== -1) {
        stories.value[storyIndex].jira_key = r.ticket_key;
      }
    }
  });
}

async function handleBulkUpdate() {
  const storiesToUpdate = stories.value.filter(s => s.jira_key);
  
  if (storiesToUpdate.length === 0) {
    uiStore.showError('No stories with JIRA keys to update');
    return;
  }

  const confirmed = confirm(`Update ${storiesToUpdate.length} story/stories in JIRA?`);
  if (!confirmed) {
    return;
  }

  bulkUpdating.value = true;

  try {
    // Prepare update items
    const updateItems: StoryUpdateItem[] = storiesToUpdate.map(story => {
      // Format test cases if present
      let testCasesText: string | undefined;
      if (story.test_cases && story.test_cases.length > 0) {
        testCasesText = story.test_cases.map((tc, idx) => {
          return `${idx + 1}. ${tc.title}\n   Type: ${tc.type}\n   Description: ${tc.description}\n   Expected: ${tc.expected_result}`;
        }).join('\n\n');
      }

      return {
        story_key: story.jira_key!,
        summary: story.summary,
        description: story.description,
        test_cases: testCasesText,
      };
    });

    const result = await bulkUpdateStories({
      stories: updateItems,
      dry_run: false, // Actually update
      async_mode: false, // Synchronous for now
    });

    // Check if it's a BatchResponse (async mode)
    if ('job_id' in result) {
      const batchResponse = result as BatchResponse;
      jobId.value = batchResponse.job_id;
      uiStore.showInfo(`Bulk update job started: ${batchResponse.job_id}`);
      startPolling();
    } else {
      // BulkUpdateStoriesResponse
      const bulkResponse = result as BulkUpdateStoriesResponse;
      const successCount = bulkResponse.successful || 0;
      const failCount = bulkResponse.failed || 0;
      
      if (successCount > 0) {
        uiStore.showSuccess(`Successfully updated ${successCount} story/stories`);
      }
      if (failCount > 0) {
        uiStore.showError(`Failed to update ${failCount} story/stories`);
        // Log individual errors
        if (bulkResponse.results) {
          const errors = bulkResponse.results
            .filter((r) => !r.success && r.error)
            .map((r) => `${r.story_key}: ${r.error}`);
          logError('Bulk update errors:', errors);
        }
      }
    }
  } catch (error: any) {
    uiStore.showError(error.response?.data?.detail || 'Failed to bulk update stories');
    logError('Error bulk updating stories:', error);
  } finally {
    bulkUpdating.value = false;
  }
}

function getTicketSourceLabel(source: string): string {
  switch (source) {
    case 'prd_table':
      return 'PRD';
    case 'jira_api':
      return 'JIRA';
    case 'newly_created':
      return 'New';
    default:
      return source;
  }
}

function getTicketSourceTooltip(source: string): string {
  switch (source) {
    case 'prd_table':
      return 'Found in PRD table';
    case 'jira_api':
      return 'Found in JIRA';
    case 'newly_created':
      return 'Newly created';
    default:
      return source;
  }
}

async function handleCopyUuid(uuid: string) {
  try {
    await navigator.clipboard.writeText(uuid);
    uiStore.showSuccess('UUID copied to clipboard');
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = uuid;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      uiStore.showSuccess('UUID copied to clipboard');
    } catch (err) {
      uiStore.showError('Failed to copy UUID');
    }
    document.body.removeChild(textArea);
  }
}
</script>


