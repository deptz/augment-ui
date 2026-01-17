<template>
  <div class="max-h-96 overflow-auto">
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <p class="mt-2 text-sm text-gray-500">Loading logs...</p>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="logsContent">
      <!-- Filter buttons -->
      <div v-if="hasMultipleCommands" class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="command in availableCommands"
          :key="command"
          @click="selectedCommand = command"
          :class="[
            'px-3 py-1 text-xs font-medium rounded',
            selectedCommand === command
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ command }}
        </button>
        <button
          @click="selectedCommand = null"
          :class="[
            'px-3 py-1 text-xs font-medium rounded',
            selectedCommand === null
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          All
        </button>
      </div>

      <!-- Logs display -->
      <div class="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs">
        <pre
          v-for="(log, index) in filteredLogs"
          :key="index"
          :class="[
            'whitespace-pre-wrap mb-2',
            log.type === 'error' ? 'text-red-400' : '',
            log.type === 'warning' ? 'text-yellow-400' : '',
            log.type === 'success' ? 'text-green-400' : ''
          ]"
        >{{ log.content }}</pre>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      No validation logs available
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getArtifact } from '@/api/endpoints';

interface Props {
  jobId: string;
}

const props = defineProps<Props>();

interface LogEntry {
  command?: string;
  content: string;
  type?: 'error' | 'warning' | 'success' | 'info';
}

const logsContent = ref<LogEntry[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedCommand = ref<string | null>(null);

const availableCommands = computed(() => {
  const commands = new Set<string>();
  logsContent.value.forEach(log => {
    if (log.command) {
      commands.add(log.command);
    }
  });
  return Array.from(commands).sort();
});

const hasMultipleCommands = computed(() => {
  return availableCommands.value.length > 1;
});

const filteredLogs = computed(() => {
  if (!selectedCommand.value) {
    return logsContent.value;
  }
  return logsContent.value.filter(log => log.command === selectedCommand.value);
});

onMounted(async () => {
  await loadLogs();
});

async function loadLogs() {
  if (!props.jobId || typeof props.jobId !== 'string' || props.jobId.trim().length === 0) {
    error.value = 'Invalid job ID';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    const content = await getArtifact(props.jobId, 'validation_logs');
    
    // Parse logs - could be string, array, or object
    if (typeof content === 'string') {
      // Simple string - split by lines and detect command/type
      const lines = content.split('\n');
      logsContent.value = lines
        .filter(line => line.trim().length > 0) // Filter empty lines
        .map(line => {
          const log: LogEntry = { content: line };
          
          // Detect command from line content (case-insensitive)
          const lineLower = line.toLowerCase();
          if (lineLower.includes('test') || lineLower.includes('pytest') || lineLower.includes('jest')) {
            log.command = 'test';
          } else if (lineLower.includes('lint') || lineLower.includes('flake8') || lineLower.includes('eslint') || lineLower.includes('pylint')) {
            log.command = 'lint';
          } else if (lineLower.includes('build') || lineLower.includes('npm') || lineLower.includes('make') || lineLower.includes('maven') || lineLower.includes('gradle')) {
            log.command = 'build';
          }
          
          // Detect error/warning (case-insensitive)
          if (lineLower.includes('error') || lineLower.includes('failed') || lineLower.includes('exception')) {
            log.type = 'error';
          } else if (lineLower.includes('warning') || lineLower.includes('warn')) {
            log.type = 'warning';
          } else if (lineLower.includes('success') || lineLower.includes('passed') || lineLower.includes('ok')) {
            log.type = 'success';
          } else {
            log.type = 'info';
          }
          
          return log;
        });
    } else if (Array.isArray(content)) {
      // Validate array entries
      logsContent.value = content
        .filter((entry: any) => entry && typeof entry === 'object')
        .map((entry: any) => ({
          command: entry.command || undefined,
          content: entry.content || entry.message || JSON.stringify(entry),
          type: entry.type || 'info',
        }));
    } else if (content && typeof content === 'object') {
      // Object format - try to extract logs array
      if (Array.isArray(content.logs)) {
        logsContent.value = content.logs;
      } else if (content.content) {
        logsContent.value = [{ content: String(content.content), type: 'info' }];
      } else if (content.message) {
        logsContent.value = [{ content: String(content.message), type: 'info' }];
      } else {
        logsContent.value = [{ content: JSON.stringify(content, null, 2), type: 'info' }];
      }
    } else {
      logsContent.value = [];
    }
  } catch (err: any) {
    error.value = err.response?.data?.detail || err.message || 'Failed to load validation logs';
    logsContent.value = [];
  } finally {
    loading.value = false;
  }
}
</script>
