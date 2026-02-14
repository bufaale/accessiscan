# Railway Worker Deployment Guide

## Prerequisites

1. Railway account (railway.app)
2. Supabase project with service role key
3. Anthropic API key
4. GitHub repo with worker code

## Step-by-Step Deployment

### 1. Create Railway Project

```bash
# Option A: Deploy from GitHub
1. Go to railway.app/new
2. Select "Deploy from GitHub repo"
3. Choose the app-04-ada-scanner repo
4. Set root directory: `/railway-worker`

# Option B: Deploy via CLI
railway login
railway init
railway up
```

### 2. Configure Environment Variables

In Railway dashboard → Variables:

```bash
SUPABASE_URL=https://hrkzjagsmxqeeqsvhpov.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Get from Supabase → Settings → API
ANTHROPIC_API_KEY=sk-ant-...          # Get from console.anthropic.com
```

**DO NOT SET** `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` - The Dockerfile sets this automatically.

### 3. Verify Build

Railway auto-detects the Dockerfile and builds:

1. Installs system Chromium + dependencies
2. Runs `npm install`
3. Runs `npx playwright install chromium`
4. Runs `npm run build` (compiles TypeScript)
5. Starts with `node dist/index.js`

Check the build logs for errors. Should see:
```
#10 [8/8] RUN npm run build
#10 1.234 > ada-scanner-worker@1.0.0 build
#10 1.234 > tsc
#10 DONE 3.5s
```

### 4. Monitor Deployment

Once deployed, check the runtime logs:

```
ADA Scanner Worker started. Polling for scans...
```

### 5. Test the Worker

From your Next.js app, create a test scan:

```typescript
// In your app's API route or server action
const { data } = await supabase
  .from("scans")
  .insert({
    url: "https://example.com",
    domain: "example.com",
    user_id: userId,
    scan_type: "quick",
    status: "pending",
  })
  .select()
  .single();
```

Watch Railway logs for processing:

```
[scan-id] Loading page: https://example.com
[scan-id] Page loaded in 1234ms
[scan-id] Running axe-core analysis...
[scan-id] axe-core complete: 8 rules violated, 42 rules passed
[scan-id] Score: 87/100 (A:95 AA:85 AAA:75)
[scan-id] Generating AI analysis...
[scan-id] AI analysis complete
[scan-id] Quick scan complete! Score: 87/100
```

### 6. Common Issues

#### Browser won't launch
- **Symptom**: `Error: Failed to launch chromium`
- **Fix**: Verify Dockerfile installs all dependencies (lines 4-23)
- **Check**: `ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`

#### axe-core not found
- **Symptom**: `Error: Cannot find module 'axe-core/axe.min.js'`
- **Fix**: Ensure `axe-core` is in `dependencies` (not devDependencies)
- **Check**: `npm install` runs before build

#### Supabase connection fails
- **Symptom**: `Error: Failed to fetch`
- **Fix**: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- **Check**: Service role key, not anon key

#### Worker not polling
- **Symptom**: Scans stay "pending" forever
- **Fix**: Check Railway logs for crash/restart loop
- **Check**: All env vars are set correctly

#### Memory issues (deep scans)
- **Symptom**: Railway crashes on deep scans
- **Fix**: Upgrade Railway plan (512MB → 1GB+)
- **Alternative**: Reduce concurrent scans or page limit

### 7. Scaling Considerations

**Single Worker** (Free/Hobby plan)
- Processes scans sequentially
- ~1 scan every 30-60 seconds
- Good for <100 scans/day

**Multiple Workers** (Pro plan)
- Deploy multiple instances
- Each polls independently
- Can process concurrent scans
- Use Railway's auto-scaling

**Optimization Tips**
- Quick scans: ~30s average
- Deep scans: ~2-3 minutes (10 pages)
- AI adds ~5-10s per scan
- Consider queueing system for high volume

### 8. Cost Estimates

**Railway Costs**
- Hobby: $5/month (512MB RAM, shared CPU)
- Pro: $20/month (2GB RAM, dedicated CPU)
- Usage: ~$0.001 per scan (compute time)

**Anthropic Costs** (paid users only)
- Summary: ~2K tokens = $0.001
- Fix suggestions: ~8K tokens = $0.004
- Total per scan: ~$0.005

**Total Cost per 1000 Scans**
- Railway: ~$1
- AI (paid users): ~$5
- **Total: ~$6/1000 scans**

### 9. Monitoring & Alerts

Set up Railway webhooks for:
- Deployment failures
- Runtime crashes
- High memory usage

Check Supabase for stuck scans:
```sql
SELECT id, url, status, progress, created_at
FROM scans
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '10 minutes';
```

### 10. Backup Strategy

Worker is stateless - all data in Supabase. For disaster recovery:

1. Keep Supabase backups enabled (automatic on paid plans)
2. Store Railway env vars in 1Password/LastPass
3. Keep GitHub repo as source of truth
4. Document custom Railway settings (if any)

Redeploy time: ~5 minutes from zero to running.

## Production Checklist

- [ ] All env vars set in Railway
- [ ] Worker logs show "Polling for scans..."
- [ ] Test scan completes successfully
- [ ] AI summary appears for paid users
- [ ] Free users get raw data only
- [ ] Deep scans create scan_pages records
- [ ] Error handling works (bad URLs)
- [ ] Graceful shutdown works (SIGTERM)
- [ ] Memory usage stable (<500MB for quick scans)
- [ ] Supabase connection healthy (no RLS errors)

## Rollback Plan

If deployment breaks production:

1. In Railway → Deployments → Select previous working version → "Redeploy"
2. Scans will pause during rollback (~30 seconds)
3. Pending scans will resume automatically
4. No data loss (all state in Supabase)

## Next Steps

After successful deployment:

1. Monitor first 10 scans closely
2. Check Anthropic usage dashboard for cost validation
3. Set up Railway alerts for errors
4. Create Supabase query for scan analytics
5. Test failure scenarios (invalid URLs, timeouts)
6. Document any custom tweaks or edge cases
