# Prediction System - Complete Lifecycle

## How It Works

### 1. Prediction Creation
- **Auto-created** by `manage-predictions` Edge Function
- **Frequency**: When < 3 active predictions exist
- **Duration**: 7 days from creation
- **Templates**: 3 rotating predictions (genre, decade, community)

### 2. User Voting
- Users vote once per prediction
- Vote locked after submission
- Streak updated on vote (via trigger)
- predictions_total incremented

### 3. Prediction Expiration
- **Auto-expires** when `ends_at` date passes
- `manage-predictions` function sets `is_active = false`
- Users can no longer vote
- Prediction ready for resolution

### 4. Prediction Resolution (Manual)
Admin resolves via SQL:
```sql
SELECT resolve_prediction('prediction_id', 'correct_answer');
```

This:
- Sets `correct_answer` and `is_resolved = true`
- Marks user predictions as correct/incorrect
- Awards points to winners
- Updates prediction_streak
- Increments predictions_correct

### 5. Results Display
- **getResolvedPredictions()** shows past 5 resolved predictions
- Shows correct answer with ✅
- Shows user's choice (correct ✅ or incorrect ❌)
- Shows points earned

### 6. New Predictions
- After resolution, `manage-predictions` creates new ones
- Cycle repeats every 7 days

## Edge Functions Deployed

1. **manage-predictions**
   - URL: https://vkeurtlppyytdhyknqpx.supabase.co/functions/v1/manage-predictions
   - Schedule: Daily via cron
   - Actions: Expire old, create new predictions

## Setup Required

1. **Cron Job** - Run daily in Supabase Dashboard:
   ```sql
   SELECT net.http_post(
     'https://vkeurtlppyytdhyknqpx.supabase.co/functions/v1/manage-predictions',
     '{}'::jsonb
   );
   ```

2. **Manual Resolution** - Admin runs weekly:
   ```sql
   -- Example: Resolve genre prediction
   SELECT resolve_prediction('prediction_id', 'action');
   ```

## User Experience

**Week 1**: Vote on 3 predictions → locked
**Week 2**: See results (won/lost, points) → vote on 3 new predictions
**Repeat**: Continuous cycle of predictions

## Where Results Show

Add to Vault page:
- Section below active predictions
- "Past Predictions" card
- Shows last 5 resolved with results
