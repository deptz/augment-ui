<template>
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Augment
      </h1>
      <p class="text-lg text-gray-600">
        Generate, manage, and optimize JIRA ticket with AI-powered assistance to streamline project management workflows
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Single Ticket Card -->
      <router-link
        to="/single-ticket"
        class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col hover:border-indigo-400 hover:shadow-md transition-all"
      >
        <div class="flex-1">
          <div class="flex items-center mb-4">
            <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Single Ticket Backfill
          </h3>
          <p class="text-sm text-gray-500">
            Generate and edit descriptions for individual JIRA tickets before updating
          </p>
        </div>
        <div class="mt-4 flex items-center text-sm text-indigo-600 font-medium">
          Get Started
          <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>

      <!-- Task Breakdown Card -->
      <router-link
        to="/task-breakdown"
        class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col hover:border-indigo-400 hover:shadow-md transition-all"
      >
        <div class="flex-1">
          <div class="flex items-center mb-4">
            <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Task Breakdown
          </h3>
          <p class="text-sm text-gray-500">
            Break down stories into tasks with team assignments and dependencies
          </p>
        </div>
        <div class="mt-4 flex items-center text-sm text-indigo-600 font-medium">
          Get Started
          <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>

      <!-- Story Coverage Card -->
      <router-link
        to="/story-coverage"
        class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col hover:border-indigo-400 hover:shadow-md transition-all"
      >
        <div class="flex-1">
          <div class="flex items-center mb-4">
            <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0h2a2 2 0 012-2v2m6 4V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Story Coverage Analysis
          </h3>
          <p class="text-sm text-gray-500">
            Analyze task coverage for stories and identify gaps
          </p>
        </div>
        <div class="mt-4 flex items-center text-sm text-indigo-600 font-medium">
          Get Started
          <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>

      <!-- PRD Story Sync Card -->
      <router-link
        to="/prd-sync"
        class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col hover:border-indigo-400 hover:shadow-md transition-all"
      >
        <div class="flex-1">
          <div class="flex items-center mb-4">
            <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            PRD Story Sync (WIP)
          </h3>
          <p class="text-sm text-gray-500">
            Sync story tickets from PRD documents to JIRA
          </p>
        </div>
        <div class="mt-4 flex items-center text-sm text-indigo-600 font-medium">
          Get Started
          <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>

      <!-- Sprint Planning Card -->
      <router-link
        to="/sprint-planning"
        class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex flex-col hover:border-indigo-400 hover:shadow-md transition-all"
      >
        <div class="flex-1">
          <div class="flex items-center mb-4">
            <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Sprint Planning (WIP)
          </h3>
          <p class="text-sm text-gray-500">
            Plan epic tasks across sprints based on capacity and dependencies
          </p>
        </div>
        <div class="mt-4 flex items-center text-sm text-indigo-600 font-medium">
          Get Started
          <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>
    </div>

    <!-- Features List -->
    <div class="mt-16 border-t border-gray-200 pt-10">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="flex items-start">
          <svg class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-gray-900">AI-Powered Generation</h3>
            <p class="text-sm text-gray-500">Multiple LLM providers (OpenAI, Claude, Gemini, Moonshot)</p>
          </div>
        </div>
        <div class="flex items-start">
          <svg class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-gray-900">Preview Before Update</h3>
            <p class="text-sm text-gray-500">Review and edit all changes before committing to JIRA</p>
          </div>
        </div>
        <div class="flex items-start">
          <svg class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-gray-900">A/B Testing</h3>
            <p class="text-sm text-gray-500">Test different prompts and models for optimal results</p>
          </div>
        </div>
        <div class="flex items-start">
          <svg class="h-6 w-6 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-gray-900">Coverage Analysis</h3>
            <p class="text-sm text-gray-500">Identify gaps in story implementation</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>










