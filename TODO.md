# TODO: Implement 9 Subjects Limit for Student Marks

## Plan

### 1. Backend Changes
- [x] **backend/accounts/views.py** - Added custom validation in ResultViewSet's create method to check subject count before saving
- [x] Added `subject_count` endpoint to check current subject count for a student-exam combination

### 2. Frontend Changes  
- [ ] **frontend/src/components/EnterMarks.jsx** - Add frontend validation to show warning when 9 subjects already entered for a student-exam combination

### 3. Test/Verify
- [ ] Verify students can view their own results
- [ ] Verify the 9 subjects limit works correctly

## Details

The requirement is:
- Any student marks must only be 9 subjects (to calculate)
- Students should be able to view their own results

Changes needed:
1. Backend: Validate that when entering marks, a student can only have 9 subjects per exam
2. Frontend: Show appropriate feedback when the limit is reached
3. Ensure the existing "my_results" endpoint works for students to view their results

## Completed Backend Changes

1. Added validation in `ResultViewSet.create()` to prevent adding more than 9 subjects per student per exam
2. Added new endpoint `subject_count` to get the current subject count for a student-exam combination
3. The existing `my_results` endpoint already allows students to view their own results
4. The `dashboard/stats` endpoint for students already includes their results
