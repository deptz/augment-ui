# Draft PR Feature - Improvement Recommendations

This document outlines potential improvements for the Draft PR feature, organized by priority and category.

**Note:** Analysis based on OpenAPI spec review. Most endpoints are available but not yet implemented in the frontend.

## 🔴 Critical Issues (High Priority)

### 1. **Error Recovery & Retry Mechanisms**
**Current State:** Limited retry logic, no manual retry buttons for failed operations
**Improvements:**
- Add "Retry" button for failed stages (especially for VERIFYING, APPLYING stages)
- Add retry mechanism for failed API calls (with exponential backoff)
- Better error messages with actionable steps
- **API Status:** ✅ **AVAILABLE** - `POST /draft-pr/jobs/{job_id}/retry` exists but not implemented in frontend

### 2. **Plan Approval Race Condition Handling**
**Current State:** Basic TOCTOU (Time-of-Check-Time-of-Use) error handling exists but could be improved
**Improvements:**
- Show warning when plan version changes during approval process
- Auto-refresh plan before showing approval modal
- Add optimistic UI updates with rollback on failure
- **API Needed:** Verify if backend supports optimistic locking or version checks

### 3. **Loading State Management**
**Current State:** Multiple loading states can conflict, no unified loading indicator
**Improvements:**
- Centralize loading state management
- Show skeleton loaders instead of spinners for better UX
- Add progress percentage for long-running stages (PLANNING, APPLYING, VERIFYING)
- **API Status:** ✅ **AVAILABLE** - `GET /draft-pr/jobs/{job_id}/progress` exists with percentage, ETA, and current step (not implemented)

## 🟡 UX/UI Improvements (Medium Priority)

### 4. **Plan Comparison Enhancement**
**Current State:** Basic comparison view, limited navigation
**Improvements:**
- Side-by-side diff view for plan specs
- Highlight specific changes (added/modified/removed sections)
- Navigate to specific sections from comparison
- Export comparison as markdown/PDF
- **API Status:** ✅ **ENHANCED AVAILABLE** - `comparePlans` supports `format` parameter: `'summary'` (default), `'structured'` (detailed), or `'unified'` (unified diff format) - not using format parameter currently

### 5. **Plan Version Navigation**
**Current State:** Can only view latest plan, limited version browsing
**Improvements:**
- Add "View Version" button in sidebar to see full plan details
- Add version history timeline
- Show what changed between versions inline
- **API Status:** ✅ **AVAILABLE** - `GET /draft-pr/jobs/{job_id}/plans/{version}` returns complete plan specification with all sections - not used in UI for viewing old versions

### 6. **Progress Indicators**
**Current State:** Basic stage indicators, no time estimates
**Improvements:**
- Show estimated time remaining for each stage
- Display stage duration (how long each stage took)
- Add progress bars for multi-step stages
- Show queue position if job is waiting
- **API Status:** ✅ **AVAILABLE** - `GET /draft-pr/jobs/{job_id}/progress` provides percentage, ETA, and current step - not implemented

### 7. **Artifact Viewing**
**Current State:** Basic artifact list, limited viewing options
**Improvements:**
- Syntax highlighting for code artifacts
- Line numbers for diff views
- Search/filter within artifacts
- Side-by-side diff view for git diffs
- Copy-to-clipboard buttons
- **API Status:** ✅ **ENHANCED AVAILABLE** - `GET /draft-pr/jobs/{job_id}/artifacts/{artifact_type}/metadata` provides size, content-type, checksum - not implemented

### 8. **Form Validation & User Feedback**
**Current State:** Basic validation, limited real-time feedback
**Improvements:**
- Real-time validation for story key (check if exists in JIRA)
- Repository URL validation with connection test
- Show character counts for text areas
- Auto-save form data to localStorage
- **API Status:** ✅ **AVAILABLE** - Both endpoints exist but not implemented:
  - `GET /validate/story/{key}` - Check if story exists and is valid
  - `POST /validate/repo` - Test repository access and validate URL format

### 9. **Keyboard Navigation & Accessibility**
**Current State:** Limited keyboard support, basic accessibility
**Improvements:**
- Full keyboard navigation (Tab, Enter, Escape)
- ARIA labels for screen readers
- Focus management in modals
- Skip links for main content
- Keyboard shortcuts (e.g., `Ctrl+K` to approve, `Ctrl+R` to revise)

### 10. **Error Messages & Help Text**
**Current State:** Generic error messages, limited context
**Improvements:**
- Contextual help tooltips
- Expandable error details
- Links to documentation for common errors
- Suggested actions based on error type
- Error code reference guide

## 🟢 Feature Enhancements (Lower Priority)

### 11. **Plan Templates & Presets**
**Current State:** No way to save/reuse plan configurations
**Improvements:**
- Save scope configurations as templates
- Preset repository lists
- Quick-start templates for common scenarios
- **API Status:** ✅ **FULLY AVAILABLE** - Complete template API exists but not implemented:
  - `GET /draft-pr/templates` - List all templates
  - `POST /draft-pr/templates` - Create template
  - `GET /draft-pr/templates/{template_id}` - Get template
  - `PUT /draft-pr/templates/{template_id}` - Update template
  - `DELETE /draft-pr/templates/{template_id}` - Delete template

### 12. **Notifications & Alerts** ⚠️ **NOT NEEDED PER USER REQUEST**
**Current State:** Basic notifications, no persistent alerts
**Status:** User indicated notifications are not needed at this time
**Future Considerations:**
- Browser notifications when job completes
- Email notifications (optional)
- Slack/Teams integration
- Notification preferences

### 13. **Bulk Operations**
**Current State:** One job at a time
**Improvements:**
- Create multiple draft PRs from multiple stories
- Batch approve/reject plans
- Bulk artifact download
- **API Status:** ✅ **AVAILABLE** - Bulk endpoints exist but not implemented:
  - `POST /draft-pr/bulk/create` - Create multiple jobs in parallel with rate limiting
  - `POST /draft-pr/jobs/bulk/approve` - Approve multiple plans in parallel
  - `POST /draft-pr/jobs/bulk/cancel` - Cancel multiple jobs

### 14. **Analytics & Insights**
**Current State:** No analytics or metrics
**Improvements:**
- Job success rate dashboard
- Average time per stage
- Most common failure reasons
- Plan revision frequency
- **API Status:** ✅ **AVAILABLE** - Analytics endpoints exist but not implemented:
  - `GET /draft-pr/analytics/stats` - Get analytics statistics
  - `GET /draft-pr/analytics/jobs` - Get job analytics

### 15. **Export & Reporting**
**Current State:** Limited export options
**Improvements:**
- Export job summary as PDF
- Export plan as markdown
- Generate reports for multiple jobs
- CSV export for analytics

## 🔵 Code Quality & Performance

### 16. **Type Safety**
**Current State:** Some `any` types, loose type checking
**Improvements:**
- Strict TypeScript types for all API responses
- Remove `any` types, use proper interfaces
- Add runtime type validation with Zod or similar
- Better error type definitions

### 17. **Performance Optimizations**
**Current State:** Some unnecessary re-renders, large component trees
**Improvements:**
- Memoize expensive computations
- Virtual scrolling for long artifact lists
- Lazy load plan versions
- Debounce search/filter inputs
- Code splitting for draft PR components

### 18. **Error Handling Consistency**
**Current State:** Inconsistent error handling patterns
**Improvements:**
- Centralized error handling utility
- Consistent error message format
- Error boundary components
- Retry logic standardization

### 19. **Testing Coverage**
**Current State:** Limited test coverage for draft PR components
**Improvements:**
- Unit tests for all components
- Integration tests for workflows
- E2E tests for critical paths
- Mock API responses for testing

### 20. **Code Organization**
**Current State:** Some duplication, large components
**Improvements:**
- Extract reusable components
- Create shared composables for common logic
- Split large components into smaller ones
- Consistent naming conventions

## 🟣 API Implementation Status

### Available but Not Implemented in Frontend

**✅ All major endpoints are available in the API!** The following need to be integrated:

1. **Job Retry** ✅
   - `POST /draft-pr/jobs/{job_id}/retry` - Retry from specific stage
   - Request body: `RetryJobRequest` with `stage` parameter

2. **Progress Tracking** ✅
   - `GET /draft-pr/jobs/{job_id}/progress` - Returns `ProgressResponse` with percentage, ETA, current step

3. **Validation Endpoints** ✅
   - `GET /validate/story/{key}` - Returns `StoryValidationResponse`
   - `POST /validate/repo` - Returns `RepoValidationResponse`

4. **Plan Version Details** ✅
   - `GET /draft-pr/jobs/{job_id}/plans/{version}` - Returns complete `PlanVersion` (already implemented but not used for viewing old versions)

5. **Enhanced Comparison** ✅
   - `GET /draft-pr/jobs/{job_id}/plans/compare?from={v1}&to={v2}&format={format}`
   - Format options: `'summary'` (default), `'structured'` (detailed), `'unified'` (unified diff)
   - Currently only using default format

6. **Templates** ✅ (Full CRUD)
   - `GET /draft-pr/templates` - List templates
   - `POST /draft-pr/templates` - Create template
   - `GET /draft-pr/templates/{template_id}` - Get template
   - `PUT /draft-pr/templates/{template_id}` - Update template
   - `DELETE /draft-pr/templates/{template_id}` - Delete template

7. **Bulk Operations** ✅
   - `POST /draft-pr/bulk/create` - Create multiple jobs
   - `POST /draft-pr/jobs/bulk/approve` - Approve multiple plans
   - `POST /draft-pr/jobs/bulk/cancel` - Cancel multiple jobs

8. **Analytics** ✅
   - `GET /draft-pr/analytics/stats` - Get statistics
   - `GET /draft-pr/analytics/jobs` - Get job analytics

9. **Artifact Metadata** ✅
   - `GET /draft-pr/jobs/{job_id}/artifacts/{artifact_type}/metadata`
   - Returns `ArtifactMetadata` with size, content-type, checksum

## 📋 Implementation Priority

### Phase 1 (Immediate - Next Sprint) - API Available, Just Need Implementation
1. **Error recovery & retry mechanisms** (#1) - API ✅ Available
2. **Progress tracking integration** (#3, #6) - API ✅ Available
3. **Form validation with real-time checks** (#8) - API ✅ Available
4. **Better error messages** (#10) - Frontend only

### Phase 2 (Short-term - Next Month) - API Available
5. **Plan comparison enhancement** (#4) - Use `format=structured` or `format=unified` parameter
6. **Plan version navigation** (#5) - Use existing `getPlanVersion` endpoint
7. **Artifact metadata integration** (#7) - API ✅ Available
8. **Keyboard navigation basics** (#9) - Frontend only

### Phase 3 (Medium-term - Next Quarter) - API Available
9. **Templates feature** (#11) - Full CRUD API ✅ Available
10. **Bulk operations** (#13) - API ✅ Available
11. **Export & reporting** (#15) - Frontend only
12. **Performance optimizations** (#17) - Frontend only

### Phase 4 (Long-term - Future)
13. **Analytics dashboard** (#14) - API ✅ Available
14. **Full accessibility** (#9 complete) - Frontend only
15. **Advanced artifact viewing** (#7 enhancements) - Frontend only

## 🎯 Quick Wins (Can be done immediately)

1. **Add copy-to-clipboard buttons** for plan hashes, job IDs
2. **Improve error messages** with more context
3. **Add loading skeletons** instead of spinners
4. **Add keyboard shortcuts** for common actions (approve, revise)
5. **Add tooltips** for all action buttons
6. **Improve empty states** with helpful messages
7. **Add confirmation dialogs** for destructive actions
8. **Show last updated time** for job status
9. **Add refresh button** to manually refresh job status
10. **Improve mobile responsiveness** for all components

## 📝 Notes

- **✅ Great News:** Almost all API endpoints are already available! Most improvements are frontend implementation work.
- **API Status:** All critical endpoints exist in the OpenAPI spec. No backend changes needed for Phase 1-3.
- **Implementation Priority:** Focus on integrating existing APIs rather than requesting new ones.
- Some improvements may require design system updates
- Consider user feedback before implementing Phase 3+ features
- Performance improvements should be measured with real usage data
- Accessibility improvements should follow WCAG 2.1 AA standards
- **Notifications:** User indicated notifications are not needed at this time - removed from priority list
