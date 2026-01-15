# Phase 2 Testing Guide - Medication Management

## Testing the Implementation

### 1. Start Both Servers

**Backend (Terminal 1):**
```bash
cd server
npm run dev
# Should see: 🚀 PillTime Server running on http://localhost:3000
```

**Frontend (Terminal 2):**
```bash
cd client
npm run dev
# Should see: Local: http://localhost:5173/
```

### 2. Test Backend API Directly

#### Create a Test Medication
```bash
curl -X POST http://localhost:3000/api/medications \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aspirin",
    "dosage": "500mg",
    "frequency": "twice-daily",
    "times": ["09:00", "21:00"],
    "start_date": "2026-01-13",
    "notes": "Take with food"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Medication created successfully",
  "medication": {
    "id": 1,
    "name": "Aspirin",
    "dosage": "500mg",
    "frequency": "twice-daily",
    "times": ["09:00", "21:00"],
    "start_date": "2026-01-13",
    "end_date": null,
    "active": true,
    "notes": "Take with food",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

#### Get All Medications
```bash
curl http://localhost:3000/api/medications
```

#### Update Medication
```bash
curl -X PUT http://localhost:3000/api/medications/1 \
  -H "Content-Type: application/json" \
  -d '{
    "dosage": "1000mg"
  }'
```

#### Delete Medication
```bash
curl -X DELETE http://localhost:3000/api/medications/1
```

### 3. Test Frontend UI

#### Step 1: Open the Application
1. Navigate to http://localhost:5173
2. Click on "Medications" in the navigation

#### Step 2: Add a Medication
1. Click "+ Add Medication" button
2. Fill in the form:
   - Name: "Vitamin D"
   - Dosage: "1000 IU"
   - Frequency: "Daily"
   - Reminder Time: "09:00"
   - Start Date: Today's date
   - Notes: "Take with breakfast"
3. Click "Add Medication"
4. Verify the medication appears in the list

#### Step 3: Add Multiple Times
1. Click "+ Add Medication"
2. Enter medication details
3. Click "+ Add Another Time" to add multiple reminder times
4. Enter times: 09:00, 13:00, 21:00
5. Submit and verify all times appear on the card

#### Step 4: Edit a Medication
1. Click "Edit" on a medication card
2. Modify the dosage
3. Click "Update Medication"
4. Verify changes are saved

#### Step 5: Toggle Active/Inactive
1. Click "Deactivate" on an active medication
2. Verify it moves to "Inactive Medications" section
3. Click "Activate" to reactivate
4. Verify it moves back to "Active Medications"

#### Step 6: Delete a Medication
1. Click "Delete" on a medication
2. Confirm in the dialog
3. Verify medication is removed from list

### 4. Test Form Validation

Try submitting the form with:
- [ ] Empty medication name → Should show error
- [ ] No reminder times → Should show error
- [ ] End date before start date → Should show error
- [ ] Valid data → Should successfully create

### 5. Test Responsive Design

1. Resize browser window
2. Verify medications display properly on:
   - Desktop (3 columns)
   - Tablet (2 columns)
   - Mobile (1 column)

### 6. Test Edge Cases

- [ ] Create medication with very long name
- [ ] Create medication with many reminder times (5+)
- [ ] Create medication with end date
- [ ] Create medication without dosage
- [ ] Create medication without notes
- [ ] Delete all medications (should show empty state)

## Expected Behavior

### Empty State
When no medications exist, should show:
- Icon
- "No medications" message
- Helpful text: "Get started by adding your first medication."

### Loading State
While fetching data, should show:
- Spinning loader

### Active/Inactive Separation
- Active medications shown first
- Inactive medications shown below
- Count displayed for each section

### Form Behavior
- Form validation on submit
- Error messages display below fields
- Cancel button clears form
- Success closes form and shows new medication

## Components Created

✅ `useMedications` hook - State management and API calls
✅ `MedicationForm` - Add/edit medication form with validation
✅ `MedicationCard` - Display single medication
✅ `MedicationList` - Display all medications with empty/loading states
✅ `MedicationsPage` - Main page component

## API Integration

All operations use the API service layer:
- `medicationsApi.getAll()` - Fetch medications
- `medicationsApi.create()` - Create medication
- `medicationsApi.update()` - Update medication
- `medicationsApi.delete()` - Delete medication

## Features Implemented

✅ Add new medication
✅ Edit existing medication
✅ Delete medication
✅ Toggle active/inactive status
✅ Multiple reminder times
✅ Form validation
✅ Loading states
✅ Error handling
✅ Empty state
✅ Responsive grid layout
✅ Active/inactive separation

---

**Phase 2 Status:** ✅ Complete
**Next Phase:** Phase 3 - Daily Tracking System
